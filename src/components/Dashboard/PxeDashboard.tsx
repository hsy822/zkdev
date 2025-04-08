import React, { useState } from 'react';
import { createPXEClient } from '@aztec/aztec.js';
import NoteExplorerSection from './NoteExplorerSection';

export default function PxeDashboard() {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [pxeInfo, setPxeInfo] = useState<any>({});
  const [logs, setLogs] = useState<any[]>([]);

  const connectToPXE = async () => {
    setStatus('connecting');
    try {
      const pxe = await createPXEClient('http://localhost:8080');
      const blockNumber = await pxe.getBlockNumber();
      const info = await pxe.getPXEInfo();
      const publicLogs = await pxe.getPublicLogs({ fromBlock: 0, toBlock: blockNumber });

      setPxeInfo(info);
      setLogs(publicLogs.logs ?? []);
      setStatus('connected');
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  const sectionStyle = {
    backgroundColor: '#f9f9f9',
    border: '1px solid #cce3cc',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '2rem',
  };

  const sectionTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#2f855a',
    marginBottom: '0.5rem',
  };

  const logBoxStyle = {
    backgroundColor: '#f3f3f3',
    border: '1px solid #ddd',
    padding: '0.75rem',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap' as const,
    overflowY: 'auto' as const,
    maxHeight: '300px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '0' }}>
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeeba',
          padding: '0.75rem 1rem',
          borderRadius: '6px',
          marginBottom: '2rem',
          fontSize: '0.95rem',
          color: '#856404',
        }}>
          ⚠️ This dashboard requires a local PXE running at <code>http://localhost:8080</code>. 
          Please make sure PXE is installed and running.
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          onClick={connectToPXE}
          disabled={status === 'connecting'}
          style={{
            backgroundColor: '#ffffff',
            border: '2px solid #38a169',
            color: '#2f855a',
            padding: '0.5rem 1.2rem',
            fontWeight: 'bold',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: '0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e6fffa')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          {status === 'connecting' ? '🔄 Connecting to PXE...' : '🖥️ Connect to PXE'}
        </button>
        {status === 'error' && (
          <p style={{ color: '#e53e3e', marginTop: '1rem' }}>
            ❌ Failed to connect. Please ensure PXE is running locally.
          </p>
        )}
      </div>

      {status === 'connected' && (
        <>
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>[ PXE Info ]</h2>
            <div style={logBoxStyle}>{JSON.stringify(pxeInfo, null, 2)}</div>
          </section>

          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>[ Public Logs ]</h2>
            <div style={logBoxStyle}>
              {logs.length > 0
                ? logs.map((log, i) => `#${i + 1}: ${JSON.stringify(log)}\n`).join('')
                : 'No logs found'}
            </div>
          </section>

          <NoteExplorerSection />
        </>
      )}
    </div>
  );
}
