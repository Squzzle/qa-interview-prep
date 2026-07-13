import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// URL/base path are overridable via env so the same build works both for the
// nginx/Docker (root) deploy and for GitHub Pages (served under /<repo>/).
// The GitHub Actions workflow injects SITE_URL and BASE_URL from the repo
// context; locally they default to root so Docker/minikube keep working.
const config: Config = {
  title: 'QA Interview Prep',
  tagline: 'Подготовка к собеседованиям по тестированию (2025–2026)',
  favicon: 'img/favicon.ico',
  url: process.env.SITE_URL || 'http://localhost',
  baseUrl: process.env.BASE_URL || '/',
  trailingSlash: false,
  organizationName: process.env.GH_ORG || 'your-github-username',
  projectName: process.env.GH_REPO || 'qa-interview-prep',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  i18n: {defaultLocale: 'ru', locales: ['ru']},
  presets: [
    ['classic', {
      docs: {
        sidebarPath: './sidebars.ts',
        routeBasePath: '/docs',
        exclude: [
          '**/_*.{js,jsx,ts,tsx,md,mdx}',
          '**/_*/**',
          '**/*.test.{js,jsx,ts,tsx}',
          '**/__tests__/**',
          'superpowers/**',
        ],
      },
      blog: false,
      theme: {customCss: './src/css/custom.css'},
    } satisfies Preset.Options],
  ],
  themeConfig: {
    navbar: {
      title: 'QA Interview Prep',
      items: [
        {type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Вопросы'},
        {to: '/test', label: 'Пройти тест', position: 'left'},
      ],
    },
    footer: {style: 'dark', links: [], copyright: 'QA Interview Prep'},
  } satisfies Preset.ThemeConfig,
};

export default config;
