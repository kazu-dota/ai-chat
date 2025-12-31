import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2Eテスト設定
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* テストタイムアウト（2分） */
  timeout: 120000,

  /* 並列実行の最大ワーカー数 */
  /* 有料版のため並列実行を有効化 */
  fullyParallel: true,

  /* CIでのみfail fast */
  forbidOnly: !!process.env.CI,

  /* リトライ設定 */
  retries: process.env.CI ? 2 : 0,

  /* 並列ワーカー数 - 有料版のため4ワーカーで並列実行 */
  workers: process.env.CI ? 1 : 4,

  /* レポーター */
  reporter: [
    ['html'],
    ['list']
  ],

  /* 全テストで共通の設定 */
  use: {
    /* ベースURL */
    baseURL: 'http://localhost:5173',

    /* トレース設定（失敗時のみ記録） */
    trace: 'on-first-retry',

    /* スクリーンショット設定 */
    screenshot: 'only-on-failure',

    /* ビデオ設定 */
    video: 'retain-on-failure',
  },

  /* テスト実行前にサーバーを起動（オプション） */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  /* プロジェクト設定（ブラウザ別） */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* モバイルビューのテスト */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
});
