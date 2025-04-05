import React, { useEffect, useState } from 'react';

export default function GlassBridgeGame() {
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    setShowIframe(true); 
  }, []);

  return (
    showIframe ? (
      <iframe
        src="/games/glass-bridge/index.html"
        width="100%"
        height="600"
        style={{ border: '1px solid #ccc', borderRadius: '8px' }}
        allow="clipboard-write"
      />
    ) : null
  );
}
