import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'QA Interview Prep',
  tagline: 'Подготовка к собеседованиям по тестированию (2025–2026)',
  favicon: 'img/favicon.ico',
  url: 'http://localhost',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {defaultLocale: 'ru', locales: ['ru']},
  presets: [
    ['classic', {
      docs: {sidebarPath: './sidebars.ts', routeBasePath: '/docs'},
      blog: false,
      theme: {customCss: './src/css/custom.css'},
    } satisfies Preset.Options],
  ],
  themeConfig: {
    navbar: {
      title: 'QA Interview Prep',
      items: [
        {type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Вопросы'},
        {to: 'pathname:///test', label: 'Пройти тест', position: 'left'},
      ],
    },
    footer: {style: 'dark', links: [], copyright: 'QA Interview Prep'},
  } satisfies Preset.ThemeConfig,
};

export default config;
