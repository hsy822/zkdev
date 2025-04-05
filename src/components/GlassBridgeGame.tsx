import React from 'react';

export default function GlassBridgeGame() {
  if (typeof window === 'undefined') return null;

  return (
    <iframe
      src="/games/glass-bridge/index.html"
      width="100%"
      height="600"
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
      allow="clipboard-write"
    />
  );
}
