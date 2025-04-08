import React, { useEffect, useState } from 'react';
import { Noir } from '@noir-lang/noir_js';

export default function ProofVerifier() {
  const [backend, setBackend] = useState<any>(null);
  const [proofInput, setProofInput] = useState('');
  const [publicHash, setPublicHash] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [{ UltraHonkBackend } ] = await Promise.all([
        import('@aztec/bb.js')
      ]);
      const programBytecode = 'H4sIAAAAAAAA/9VUSw7CIBAF+lV3noTpQBl2XkUivf8JjDSlEdGVpYu+ZDIvECbvDQOcLbiEaNk3RMy3mOU2QFoL5aiUN4MHhLscrCMtlXYjAYEm/RgI0ZMiY5010oJCD5O2OMViVTldck/PvKDn+iCeRUHPzU6eeeZ5q87uf52YL8zariHqTOszcp5wkfAu8vVcH+IU4syWN16zT4jCPWgLzlBf8N554r3NZmDuQRX3G/bu9a//cMUL4gkRrjgFAAA=';
      const backend = new UltraHonkBackend(programBytecode);

      setBackend(backend);
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
      setVerifying(true);
      setResult(null);

      const proofBytes = hexToBytes(proofInput.trim());
      const publicInputs = [publicHash.trim()];

      const verified = await backend.verifyProof({ proof: proofBytes, publicInputs }, {keccak: true});

      setResult(verified ? '✅ Valid proof!' : '❌ Invalid proof.');
    } catch (e) {
      console.error(e);
      setResult('⚠️ An error occurred. Please check your input values.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: '#1e1e1e',
      color: '#f1f1f1',
      borderRadius: '12px',
      maxWidth: '600px',
      margin: '2rem auto',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>🧪 Proof Verifier</h2>

      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
        Proof (hex):
      </label>
      <textarea
        rows={4}
        placeholder="0x..."
        value={proofInput}
        onChange={(e) => setProofInput(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #555',
          background: '#2b2b2b',
          color: '#f1f1f1',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}
      />

      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
        Public input (public_hash):
      </label>
      <input
        type="text"
        placeholder="0x..."
        value={publicHash}
        onChange={(e) => setPublicHash(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: '1px solid #555',
          background: '#2b2b2b',
          color: '#f1f1f1',
          marginBottom: '1.5rem',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}
      />

      <button
        onClick={handleVerify}
        disabled={verifying}
        style={{
          padding: '0.6rem 1.2rem',
          background: verifying ? '#666' : '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: verifying ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        {verifying ? 'Verifying...' : 'Verify'}
      </button>

      {result && (
        <p style={{
          marginTop: '1.5rem',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          color: result.includes('✅') ? '#4caf50' : result.includes('❌') ? '#f44336' : '#ffc107'
        }}>
          {result}
        </p>
      )}
    </div>
  );
}