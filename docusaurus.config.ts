import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

import webpack from 'webpack';
import path from 'path';

const config: Config = {
  title: 'zkDev',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://zkdev.net',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-MDC9QD6LRJ',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      disableSwitch: true,
    },
    navbar: {
      title: 'zkDev',
      logo: {
        alt: 'zkDev Logo',
        src: 'img/logo-light.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'remixSidebar', 
          position: 'left',
          label: 'Aztec Remix Plugin',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialsSidebar', 
          position: 'left',
          label: 'Tutorials',
        },
        {
          type: 'docSidebar',
          sidebarId: 'validatingSidebar', 
          position: 'left',
          label: 'Validating Log',
        },
        {
          type: 'docSidebar',
          sidebarId: 'proofportSidebar', 
          position: 'left',
          label: 'Proofport',
        },
        // {
        //   type: 'docSidebar',
        //   sidebarId: 'boardSidebar', 
        //   position: 'left',
        //   label: 'Dashboard',
        // },
        
        
      ],
    },
    
    // footer: {
    //   style: 'dark',
    //   links: [
    //     {
    //       title: 'Docs',
    //       items: [
    //         {
    //           label: 'Tutorial',
    //           to: '/docs/intro',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'Community',
    //       items: [
    //         {
    //           label: 'Stack Overflow',
    //           href: 'https://stackoverflow.com/questions/tagged/docusaurus',
    //         },
    //         {
    //           label: 'Discord',
    //           href: 'https://discordapp.com/invite/docusaurus',
    //         },
    //         {
    //           label: 'X',
    //           href: 'https://x.com/docusaurus',
    //         },
    //       ],
    //     },
    //     {
    //       title: 'More',
    //       items: [
    //         {
    //           label: 'Blog',
    //           to: '/blog',
    //         },
    //         {
    //           label: 'GitHub',
    //           href: 'https://github.com/facebook/docusaurus',
    //         },
    //       ],
    //     },
    //   ],
    //   copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    // },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

config.plugins = [
  function webpackConfigPlugin() {
    return {
      name: 'custom-webpack-config',
      configureWebpack() {
        return {
          resolve: {
            fallback: {
              util: require.resolve('util/'),
              crypto: require.resolve('crypto-browserify'),
              stream: require.resolve('stream-browserify'),
              buffer: require.resolve('buffer/'),
              process: require.resolve('process/browser.js'),
              assert: require.resolve('assert/'),
              path: require.resolve('path-browserify'),
              tty: require.resolve('tty-browserify'),
            },
          },
          plugins: [
            new webpack.ProvidePlugin({
              Buffer: ['buffer', 'Buffer'],
              process: 'process/browser.js',
            }),
          ],
        };
      },
    };
  },
];

export default config;
