import React from 'react';

export default function GlassBridgeGame() {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<iframe
          src="/games/glass-bridge/index.html"
          width="100%"
          height="600"
          style="border:none; border-radius:8px;"
          allow="clipboard-write"
          loading="lazy"
        ></iframe>`
      }}
    />
  );
}
