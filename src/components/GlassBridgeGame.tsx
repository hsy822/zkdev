// src/components/GlassBridgeGame.tsx
import React, { useEffect, useState } from 'react';

export default function GlassBridgeGame() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <iframe
      src="/games/glass-bridge/index.html"
      width="100%"
      height="600"
      style={{
        border: '1px solid #ccc',
        borderRadius: '8px'
      }}
      allow="clipboard-write"
    />
  );
}
