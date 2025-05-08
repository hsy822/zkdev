import React, { useEffect, useState } from "react";
import { poseidon2 } from "poseidon-lite";
import { init as garagaInit, getHonkCallData } from "garaga";
import { connect as connectStarknet } from "starknetkit";
import { RpcProvider, Contract } from "starknet";

interface CircuitMeta {
  circuit_id: string;
  version: string;
  description: string;
  public_inputs: string[];
  metadata: any;
}
// cip-001-group-membership
const MAX_DEPTH = 4;

function hash2(a: bigint, b: bigint): bigint {
  return poseidon2([a, b]);
}

function toHex(n: bigint): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

async function getWalletAddress(chainId: string): Promise<string> {
  if (chainId.startsWith("starknet")) {
    const starknet = await connectStarknet({ modalMode: "alwaysAsk" });
    if (!starknet) throw new Error("Starknet wallet not available");
    return starknet.connectorData.account;
  }

  if ((window as any).ethereum) {
    const [address] = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    return address;
  }

  throw new Error("No wallet found.");
}

export default function Proofport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<CircuitMeta | null>(null);
  const [showBackButton, setShowBackButton] = useState(false);
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<string>("");
  const [nonce, setNonce] = useState<string>("");
  const [issuedAt, setIssuedAt] = useState(0);

  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const circuitId = params.get("circuit_id")!;
  const chainId = params.get("chain_id")!;
  const passedInRoot = params.get("root")!;

  const steps = [
    { key: "connect", label: "Connecting wallet" },
    { key: "load", label: "Loading circuit" },
    { key: "execute", label: "Executing circuit" },
    { key: "prove", label: "Generating proof" },
    { key: "calldata", label: "Preparing Starknet calldata" },
    { key: "complete", label: "Proof ready" },
  ];
  
  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // if (event.origin !== "https://proofport-demo-dapp.vercel.app") return;
  
      const data = event.data;
      if (Array.isArray(data.whitelist)) {
        setWhitelist(data.whitelist);
      } else {
        setThreshold(data.threshold);
      }
      setNonce(data.nonce);
      setIssuedAt(data.issued_at);
    }
  
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  
  // useEffect(() => {
  //   try {
  //     const data = JSON.parse(window.name);
  //     console.log({data})
  //     if (Array.isArray(data.whitelist)) {
  //       // group-membership
  //       setWhitelist(data.whitelist);
  //     } else {
  //       // eth-balance
  //       setThreshold(data.threshold);
  //     }
  //     setNonce(data.nonce);
  //     setIssuedAt(data.issued_at);
  //   } catch {
  //     setError("Failed to load whitelist from dApp.");
  //   }
  // }, []);

  const REGISTRY_URL = "https://raw.githubusercontent.com/hsy822/proofport/main/packages/registry/verifier_registry.json";

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(REGISTRY_URL);
        const registry = await res.json();
        if (registry[circuitId]) {
          setMeta(registry[circuitId]);
        } else {
          setError("Unknown circuit ID.");
        }
      } catch {
        setError("Failed to load circuit registry.");
      }
    })();
  }, [circuitId]);

  // group-membership
  const handleGenerateProofForGroupMembership = async () => {
    try {
      setLoading(true);
      setCurrentStep("connect");
      const addressStr = await getWalletAddress(chainId);
      if (!addressStr) throw new Error("No wallet address retrieved");
      
      const address = BigInt(addressStr);
      const identityCommitment = poseidon2([address, 0n]);

      const normalizedLeaves = whitelist.map((v) => poseidon2([BigInt(v.toLowerCase()), 0n]));
      const hashedLeaves = whitelist.map((v) => poseidon2([BigInt(v), 0n]));
      const index = normalizedLeaves.findIndex((v) => v.toString() === identityCommitment.toString());
      if (index === -1) throw new Error("Address not in allowlist");

      while (hashedLeaves.length < 2 ** MAX_DEPTH) hashedLeaves.push(0n);
      const tree: bigint[][] = [hashedLeaves];
      for (let d = 0; d < MAX_DEPTH; d++) {
        const prev = tree[d];
        const next: bigint[] = [];
        for (let i = 0; i < prev.length; i += 2) {
          next.push(hash2(prev[i], prev[i + 1]));
        }
        tree.push(next);
      }

      const computedRoot = tree[MAX_DEPTH][0];

      // Sanity check: reject if whitelist Merkle root doesn't match the expected root from dApp
      if (toHex(computedRoot) !== passedInRoot) throw new Error("Root mismatch");

      const siblings: bigint[] = [];
      let i = index;
      for (let d = 0; d < MAX_DEPTH; d++) {
        siblings.push(tree[d][i ^ 1]);
        i = Math.floor(i / 2);
      }

      const merkle_proof_indices = Array.from({ length: MAX_DEPTH }, (_, i) =>
        ((index >> i) & 1).toString()
      );

      setCurrentStep("load");
      const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
        import("@noir-lang/noir_js"),
        import("@aztec/bb.js"),
      ]);
      const noir = new Noir(meta!.metadata);
      const backend = new UltraHonkBackend(meta!.metadata.bytecode, { threads: 2 });

      const inputs = {
        identity_commitment: identityCommitment.toString(),
        merkle_proof_length: MAX_DEPTH.toString(),
        merkle_proof_indices,
        merkle_proof_siblings: siblings.map((x) => x.toString()),
        root: computedRoot.toString(),
      };

      setCurrentStep("execute");
      const { witness } = await noir.execute(inputs);

      setCurrentStep("prove");
      const proof = await backend.generateProof(witness, { keccak: true });
      backend.destroy();

      const rawProof = proof.proof;
      const proofHex = "0x" + Buffer.from(rawProof).toString("hex");
      const formattedPublicInputs = toHex(BigInt(proof.publicInputs[0]));

      let calldata: any = null;
      if (chainId.startsWith("starknet")) {
        setCurrentStep("calldata");
        await garagaInit();
        const vkRes = await fetch(`/vk/vk_${circuitId}.bin`);
        const vkBuffer = await vkRes.arrayBuffer();
        const vk = new Uint8Array(vkBuffer);
        calldata = getHonkCallData(rawProof, flattenFieldsAsArray(proof.publicInputs), vk, 0);
      }

      window.opener.postMessage(
        {
          proof: proofHex,
          publicInputs: { root: formattedPublicInputs },
          circuitId,
          chainId,
          issued_at: issuedAt,
          nonce,
          ...(calldata && { calldata }),
        },
        "*"
      );

      setCurrentStep("complete");
      setShowBackButton(true);
    } catch (err: any) {
      console.error("Error during proof generation:", err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // eth-balance
  const handleGenerateProofForEthBalance = async () => {
    try {
      setLoading(true);
      setCurrentStep("connect");
      const address = await getWalletAddress(chainId);
      if (!address) throw new Error("No wallet address retrieved");
      let sepoliaRpc = "";
      let inputs = {};
      if (chainId.startsWith("starknet")) {
        sepoliaRpc = "https://starknet-sepolia.infura.io/v3/2622f26051844e03b6a73b23d6990825";
        const provider = new RpcProvider({nodeUrl: sepoliaRpc });
        const ETH_CONTRACT = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
        const ABI = [
          {
            "type": "function",
            "name": "balanceOf",
            "inputs": [{ "name": "account", "type": "felt" }],
            "outputs": [{ "name": "balance", "type": "felt" }],
            "state_mutability": "view"
          }
        ];
        const eth = new Contract(ABI, ETH_CONTRACT, provider);
        const { balance } = await eth.balanceOf(address);
        console.log(balance)
        const val = BigInt(balance); // hex -> bigint
        inputs = {
          balance: val.toString(),
          threshold: BigInt(threshold || 0).toString(),
        }
      } else {
        sepoliaRpc = "https://sepolia.infura.io/v3/2622f26051844e03b6a73b23d6990825";
        const res = await fetch(sepoliaRpc, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_getBalance",
            params: [address, "latest"],
          }),
        });
      
        const { result } = await res.json();
      
        if (!result) throw new Error("Failed to fetch balance from Sepolia");
      
        const balance = BigInt(result); // hex -> bigint
      
        inputs = {
          balance: balance.toString(),
          threshold: BigInt(threshold || 0).toString(),
        }
      }

      setCurrentStep("load");
      const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
        import("@noir-lang/noir_js"),
        import("@aztec/bb.js"),
      ]);
      const noir = new Noir(meta!.metadata);
      const backend = new UltraHonkBackend(meta!.metadata.bytecode, { threads: 2 });

      setCurrentStep("execute");
      const { witness } = await noir.execute(inputs);

      setCurrentStep("prove");
      const proof = await backend.generateProof(witness, { keccak: true });
      backend.destroy();

      const rawProof = proof.proof;
      const proofHex = "0x" + Buffer.from(rawProof).toString("hex");
      const formattedPublicInputs = toHex(BigInt(proof.publicInputs[0]));

      let calldata: any = null;
      if (chainId.startsWith("starknet")) {
        setCurrentStep("calldata");
        await garagaInit();
        const vkRes = await fetch(`/vk/vk_${circuitId}.bin`);
        const vkBuffer = await vkRes.arrayBuffer();
        const vk = new Uint8Array(vkBuffer);
        calldata = getHonkCallData(rawProof, flattenFieldsAsArray(proof.publicInputs), vk, 0);
      }

      window.opener.postMessage(
        {
          proof: proofHex,
          publicInputs: { threshold: formattedPublicInputs },
          circuitId,
          chainId,
          issued_at: issuedAt,
          nonce,
          ...(calldata && { calldata }),
        },
        "*"
      );

      setCurrentStep("complete");
      setShowBackButton(true);
    } catch (err: any) {
      console.error("Error during proof generation:", err);
      setError(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="zk-glass-card">
      {error && <p className="zk-error">{error}</p>}
  
      {meta && (
        <div className="zk-meta">
          <p><strong>Circuit:</strong> {meta.circuit_id}</p>
          <p><strong>Version:</strong> {meta.version}</p>
          <p><strong>Description:</strong> {meta.description}</p>
          <p><strong>Required Inputs:</strong> {meta.public_inputs.join(", ")}</p>
        </div>
      )}
  
      <div className="zk-progress-bar">
        <div
          className="zk-progress-fill"
          style={{ width: `${((steps.findIndex(s => s.key === currentStep) + 1) / steps.length) * 100}%` }}
        />
      </div>
  
      <ul className="zk-step-list">
        {steps.map(({ key, label }) => {
          const currentIndex = steps.findIndex(s => s.key === currentStep);
          const stepIndex = steps.findIndex(s => s.key === key);
          const isPast = stepIndex < currentIndex;
          const isNow = stepIndex === currentIndex;
  
          const stepClass = isNow ? "zk-step-current" : isPast ? "zk-step-past" : "zk-step-future";
          return <li key={key} className={`zk-step ${stepClass}`}>• {label}</li>;
        })}
      </ul>
  
      {!currentStep && (
        <p className="zk-subtext">Click below to generate your zero-knowledge proof.</p>
      )}
  
      <button
        disabled={loading}
        onClick={circuitId === "group-membership" ? handleGenerateProofForGroupMembership : handleGenerateProofForEthBalance}
        className="zk-button"
      >
        {loading ? "Generating..." : "Connect & Prove"}
      </button>
  
      {showBackButton && (
        <button className="zk-back-button" onClick={() => window.close()}>
          Back to DApp
        </button>
      )}
    </div>
  );
  
}

function flattenFieldsAsArray(fields: string[]): Uint8Array {
  return flattenUint8Arrays(fields.map(hexToUint8Array));
}

function flattenUint8Arrays(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

function hexToUint8Array(hex: string): Uint8Array {
  const h = BigInt(hex).toString(16).padStart(64, "0");
  const len = h.length / 2;
  const arr = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    arr[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  }
  return arr;
}
