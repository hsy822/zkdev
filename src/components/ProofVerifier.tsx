import React, { useEffect, useState } from 'react';
import { Noir } from '@noir-lang/noir_js';

export default function ProofVerifier() {
  const [backend, setBackend] = useState<any>(null);
  const [noir, setNoir] = useState<any>(null);
  const [proofInput, setProofInput] = useState('');
  const [publicHash, setPublicHash] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
        const [{ UltraPlonkBackend }, circuitJson] = await Promise.all([
          import('@aztec/bb.js'),
          fetch('/circuits/main.json').then((res) => res.json()),
        ]);
  
        const backend = new UltraPlonkBackend(circuitJson);
        const noir = new Noir(circuitJson);
        setBackend(backend);
        setNoir(noir);
        setReady(true);
      };
  
      init();
  }, []);

  if (!ready) return <div>Loading Noir verifier...</div>;
  
  const hexToBytes = (hex: string): Uint8Array => {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  };

  const handleVerify = async () => {
    try {
      if (!backend) throw new Error('Backend not ready');

      const proofBytes = hexToBytes(proofInput.trim());
      const publicInputs = [publicHash.trim()];

      const verified = await backend.verifyProof({
        proof: proofBytes,
        publicInputs,
      });

      setResult(verified ? '✅ Valid proof!' : '❌ Invalid proof.');
    } catch (e) {
      console.error(e);
      setResult('⚠️ An error occurred');
    }
  };

  return (
    <div>
      <h3>🧪 Noir Proof Verifier</h3>
      <input
        placeholder="proof hex"
        value={proofInput}
        onChange={(e) => setProofInput(e.target.value)}
      />
      <input
        placeholder="public hash"
        value={publicHash}
        onChange={(e) => setPublicHash(e.target.value)}
      />
      <button onClick={handleVerify}>Verify</button>
      {result && <p>{result}</p>}
    </div>
  );
}
