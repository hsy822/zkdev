import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  remixSidebar: [
    {
      type: 'category',
      label: 'Aztec Remix Plugin',
      collapsed: false,
      items: ['remix/intro', 'remix/connect', 'remix/usage'],
    },
  ],
  tutorialsSidebar: [
    {
      type: 'category',
      label: 'Tutorials',
      collapsed: false,
      items: ['tutorial/authwit', 'tutorial/glass-bridge'],
    },
  ],
  nodeSidebar: [
    {
      type: 'category',
      label: 'Aztec Node Diary',
      collapsed: false,
      items: ['node/node-diary'],
    },
  ],
};

export default sidebars;
