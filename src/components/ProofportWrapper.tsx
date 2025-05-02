import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function ProofportWrapper() {
  return (
    <BrowserOnly fallback={<div>Loading Generator...</div>}>
      {() => {
        const Proofport = require('./Proofport').default;
        return <Proofport />;
      }}
    </BrowserOnly>
  );
}
