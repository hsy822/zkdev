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
  proofportSidebar: [
    {
      type: 'category',
      label: 'Proofport',
      collapsed: false,
      items: ['proofport/hello', 'proofport/sdk'],
    },
  ],
  // boardSidebar: [
  //   {
  //     type: 'category',
  //     label: 'Dashboard',
  //     collapsed: false,
  //     items: ['dashboard/PXE'],
  //   },
  // ],
  validatingSidebar: [
    {
      type: 'category',
      label: 'Validating Log',
      collapsed: false,
      items: ['node/validating-log'],
    },
  ],
  
};

export default sidebars;
