import React, { useEffect, useState } from "react";
import { poseidon2 } from "poseidon-lite";
import { init as garagaInit, getHonkCallData } from "garaga";
import { connect as connectStarknet } from "starknetkit";

interface CircuitMeta {
  circuit_id: string;
  version: string;
  description: string;
  public_inputs: string[];
  metadata: any;
}

const MAX_DEPTH = 4;

function hash2(a: bigint, b: bigint): bigint {
  return poseidon2([a, b]);
}

function toHex(n: bigint): string {
  return "0x" + n.toString(16).padStart(64, "0");
}

async function getWalletAddress(chainId: string): Promise<string> {
  if (chainId.startsWith("starknet")) {
    const starknet = await connectStarknet({ modalMode: "canAsk" });
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
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const circuitId = params.get("circuit_id")!;
  const chainId = params.get("chain_id")!;

  const steps = [
    { key: "connect", label: "Connecting wallet" },
    { key: "load", label: "Loading circuit" },
    { key: "execute", label: "Executing circuit" },
    { key: "prove", label: "Generating proof" },
    { key: "calldata", label: "Preparing Starknet calldata" },
    { key: "complete", label: "Proof ready" },
  ];

  useEffect(() => {
    try {
      const data = JSON.parse(window.name);
      if (Array.isArray(data.whitelist)) {
        setWhitelist(data.whitelist);
      } else {
        throw new Error("Whitelist not found in window.name");
      }
    } catch {
      setError("Failed to load whitelist from dApp.");
    }
  }, []);

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

  const handleGenerateProof = async () => {
    try {
      setLoading(true);
      setCurrentStep("connect");
      const addressStr = await getWalletAddress(chainId);
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

      const root = tree[MAX_DEPTH][0];
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
        root: root.toString(),
      };

      setCurrentStep("execute");
      const { witness } = await noir.execute(inputs);

      setCurrentStep("prove");
      const proof = await backend.generateProof(witness, { keccak: true });
      backend.destroy();

      const rawProof = proof.proof;
      const proofHex = "0x" + Buffer.from(rawProof).toString("hex");
      const formattedRoot = toHex(BigInt(proof.publicInputs[0]));

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
          publicInputs: { root: formattedRoot },
          circuitId,
          chainId,
          issued_at: Date.now(),
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
    <div style={{
      maxWidth: "640px",
      margin: "2rem auto",
      background: "#111",
      padding: "2rem",
      borderRadius: "12px",
      color: "#f0f0f0",
      fontFamily: "monospace",
      boxShadow: "0 0 16px rgba(0,255,160,0.2)",
    }}>
      {error && <p style={{ color: "#f66", marginBottom: "1rem" }}>{error}</p>}

      {meta && (
        <div style={{ marginBottom: "1.5rem", lineHeight: 1.6 }}>
          <p><strong>Circuit:</strong> {meta.circuit_id}</p>
          <p><strong>Version:</strong> {meta.version}</p>
          <p><strong>Description:</strong> {meta.description}</p>
          <p><strong>Required Inputs:</strong> {meta.public_inputs.join(", ")}</p>
        </div>
      )}

      <div style={{
        height: "6px",
        width: "100%",
        background: "#333",
        borderRadius: "4px",
        marginBottom: "1.2rem",
        overflow: "hidden"
      }}>
        <div style={{
          height: "100%",
          width: `${((steps.findIndex(s => s.key === currentStep) + 1) / steps.length) * 100}%`,
          background: "#00ffaa",
          transition: "width 0.5s ease"
        }} />
      </div>

      <ul style={{ marginBottom: "1.5rem", padding: 0, listStyle: "none" }}>
        {steps.map(({ key, label }) => {
          const currentIndex = steps.findIndex(s => s.key === currentStep);
          const stepIndex = steps.findIndex(s => s.key === key);
          const isPast = stepIndex < currentIndex;
          const isNow = stepIndex === currentIndex;

          const style = {
            color: isNow ? "#00ffaa" : isPast ? "#888" : "#444",
            textDecoration: isPast ? "line-through" : "none",
            fontWeight: isNow ? "bold" : "normal",
            opacity: isNow ? 1 : isPast ? 0.7 : 0.4,
            transition: "all 0.3s ease",
            marginBottom: "4px"
          };

          return <li key={key} style={style}>• {label}</li>;
        })}
      </ul>

      {!currentStep && (
        <p style={{ fontSize: "0.9rem", color: "#888" }}>
          Click below to generate your zero-knowledge proof.
        </p>
      )}

      <button
        disabled={loading}
        onClick={handleGenerateProof}
        style={{
          marginTop: "1rem",
          background: "#00ffaa",
          color: "#000",
          padding: "0.7rem 1.2rem",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "1rem",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Generating..." : "Connect & Prove"}
      </button>

      {showBackButton && (
        <button
          onClick={() => window.close()}
          style={{
            marginLeft: "1.5rem",
            background: "#fff",
            color: "#000",
            padding: "0.6rem 1rem",
            borderRadius: "8px",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
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
