import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  remixSidebar: [
    {
      type: 'category',
      label: 'Aztec Remix Plugin',
      collapsed: false,
      items: ['intro', 'connect', 'usage'],
    },
  ],
  tutorialsSidebar: [
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: ['authwit'],
    },
  ],
};

export default sidebars;
