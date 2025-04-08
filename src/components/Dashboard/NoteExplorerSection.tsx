import React, { useEffect, useState } from 'react';
import { createPXEClient, AztecAddress } from '@aztec/aztec.js';

export default function NoteExplorerSection() {
  const [accounts, setAccounts] = useState<AztecAddress[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AztecAddress | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const pxe = await createPXEClient('http://localhost:8080');
      const registered = await pxe.getRegisteredAccounts();
      setAccounts(registered.map((a) => a.address));
    };
    fetchAccounts();
  }, []);

  const fetchNotes = async (addr: AztecAddress) => {
    setLoading(true);
    setNotes([]);
    try {
      const pxe = await createPXEClient('http://localhost:8080');
      const result = await pxe.getNotes({ recipient: addr });
      setNotes(result);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const onSelectAccount = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const hex = e.target.value;
    const addr = accounts.find((a) => a.toString() === hex);
    if (addr) {
      setSelectedAccount(addr);
      fetchNotes(addr);
    }
  };

  return (
    <section style={{ marginTop: '3rem' }}>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#2f855a', marginBottom: '1rem' }}>
        🧾 Note Explorer
      </h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ fontWeight: 'bold' }}>Select Account: </label>
        <select onChange={onSelectAccount} style={{ padding: '0.4rem', marginLeft: '0.5rem' }}>
          <option value="">-- Choose an address --</option>
          {accounts.map((a, i) => (
            <option key={i} value={a.toString()}>
              {a.toString()}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>🔄 Fetching notes...</p>}

      {!loading && selectedAccount && (
        <>
          <p style={{ fontSize: '0.9rem', color: '#444', marginBottom: '0.5rem' }}>
            Total notes: <strong>{notes.length}</strong>
          </p>

          {notes.length === 0 && <p>😐 No notes found.</p>}

          <div style={{ display: 'grid', gap: '1rem' }}>
            {notes.map((note, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #cce3cc',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '6px',
                  padding: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <strong>contractAddress:</strong>{' '}
                  {note.contractAddress?.toString() || 'N/A'}
                </div>

                <div>
                  <strong>storageSlot:</strong>{' '}
                  {note.storageSlot?.toString() || 'N/A'}
                </div>

                <div>
                  <strong>value:</strong>{' '}
                  {typeof note.value === 'object'
                    ? JSON.stringify(note.value, null, 2)
                    : note.value?.toString()}
                </div>

                {note.preimage && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <strong>preimage:</strong><br />
                    <div><strong>owner:</strong> {note.preimage.owner?.toString()}</div>
                    <div><strong>amount:</strong> {note.preimage.amount?.toString()}</div>
                    <div><strong>memo:</strong> {note.preimage.memo ?? 'None'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
