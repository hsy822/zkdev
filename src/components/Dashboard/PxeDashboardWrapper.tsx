import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function PxeDashboardWrapper() {
  return (
    <BrowserOnly fallback={<div>Loading verifier...</div>}>
      {() => {
        const PxeDashboard = require('./PxeDashboard').default;
        return <PxeDashboard />;
      }}
    </BrowserOnly>
  );
}
