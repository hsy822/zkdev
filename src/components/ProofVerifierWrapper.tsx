import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import ProofVerifier from './ProofVerifier';

export default function ProofVerifierWrapper() {
  return (
    <BrowserOnly fallback={<div>Loading verifier...</div>}>
      {() => {
        // const ProofVerifier = require('./ProofVerifier').default;
        // console.log(ProofVerifier)
        return <ProofVerifier />;
      }}
    </BrowserOnly>
  );
}
