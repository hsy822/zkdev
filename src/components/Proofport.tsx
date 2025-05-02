import React, { useEffect, useState } from "react";

interface CircuitMeta {
  circuit_id: string;
  version: string;
  description: string;
  public_inputs: string[];
}

const FIELD_MODULUS = BigInt(
  "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

export default function Proofport() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [meta, setMeta] = useState<CircuitMeta | null>(null);
  const [error, setError] = useState("");

  const params = new URLSearchParams(window.location.search);
  const circuitId = params.get("circuit_id")!;
  const rootParam = params.get("root")!;
  const leafParam = params.get("leaf")!;
  const indexParam = params.get("index")!;
  const hashpathParam = params.get("hashpath")!;

  const rawPath = JSON.parse(decodeURIComponent(hashpathParam)) as string[];

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/circuit-registry/verifier_registry.json");
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
    setLoading(true);
    try {
      setStatus("📦 Loading circuit...");
      const [{ Noir }, { UltraHonkBackend }] = await Promise.all([
        import("@noir-lang/noir_js"),
        import("@aztec/bb.js"),
      ]);

      const circuit = await fetch(`/circuits/${circuitId}.json`).then((r) =>
        r.json()
      );
      const noir = new Noir(circuit);
      const backend = new UltraHonkBackend(circuit.bytecode);

      setStatus("🧠 Executing circuit...");

      const rawLeaf = BigInt(leafParam) % FIELD_MODULUS;
      const rawIndex = BigInt(indexParam);
      const rawRoot = BigInt(rootParam) % FIELD_MODULUS;

      let hashpath = rawPath.map((h) => BigInt(h) % FIELD_MODULUS);
      while (hashpath.length < 8) hashpath.push(0n);
      if (hashpath.length > 8) hashpath = hashpath.slice(0, 8);

      const inputs = {
        leaf: rawLeaf.toString(),
        index: rawIndex.toString(),
        hashpath: hashpath.map((h) => h.toString()),
        root: rawRoot.toString(),
      };

      console.log("🧾 Inputs to Noir:", inputs);

      const { witness } = await noir.execute(inputs);
      setStatus("🛠 Generating proof...");
      const { proof } = await backend.generateProof(witness);

      window.opener.postMessage(
        {
          proof,
          publicInputs: { root: rootParam },
          circuitId,
          issued_at: Date.now(),
        },
        "*"
      );

      setStatus("✅ Proof generated and sent!");
    } catch (err: any) {
      console.error("🚨 Error during proof generation:", err);
      setStatus(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "640px",
        margin: "2rem auto",
        background: "#111",
        padding: "2rem",
        borderRadius: "12px",
        color: "#f0f0f0",
        fontFamily: "monospace",
        boxShadow: "0 0 16px rgba(0,255,160,0.2)",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
        🛡️ Proofport Portal
      </h2>

      {error && <p style={{ color: "#f66" }}>{error}</p>}

      {meta && (
        <div style={{ marginBottom: "1.5rem", lineHeight: 1.6 }}>
          <p>
            <strong>🎯 Circuit:</strong> <code>{meta.circuit_id}</code>
          </p>
          <p>
            <strong>📄 Version:</strong> {meta.version}
          </p>
          <p>
            <strong>🔐 Description:</strong> {meta.description}
          </p>
          <p>
            <strong>📥 Required Inputs:</strong>{" "}
            {meta.public_inputs.join(", ")}
          </p>
        </div>
      )}

      <p>{status || "Click below to generate your zero-knowledge proof."}</p>

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
        {loading ? "🔄 Generating..." : "🔐 Connect & Prove"}
      </button>
    </div>
  );
}
