import React from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import GlassBridgeGame from './GlassBridgeGame';

export default function GlassBridgeWrapper() {
  return (
    <BrowserOnly fallback={<div>Loading game...</div>}>
      {() => <GlassBridgeGame />}
    </BrowserOnly>
  );
}
