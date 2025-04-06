import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function ProofVerifierWrapper() {
  return (
    <BrowserOnly fallback={<div>Loading verifier...</div>}>
      {() => {
        const ProofVerifier = require('./ProofVerifier').default;
        return <ProofVerifier />;
      }}
    </BrowserOnly>
  );
}
