import { test, expect } from '@playwright/test';
import { waitForPageLoad } from './helpers/test-helpers.js';

test.describe('初期表示テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('initial-001: ページが正しく読み込まれる', async ({ page }) => {
    // ページタイトルを確認
    await expect(page).toHaveTitle(/AIチャット/);

    // エラーが表示されていないことを確認
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).not.toBeVisible();
  });

  test('initial-002: スレッド未選択時にウェルカム画面が表示される', async ({ page }) => {
    // ウェルカムメッセージが表示されることを確認
    await expect(page.locator('text=AIチャットへようこそ')).toBeVisible();

    // ウェルカムアイコンが表示されることを確認
    await expect(page.locator('.welcome-icon')).toBeVisible();

    // 案内文が表示されることを確認
    await expect(page.locator('text=新しい会話を始めるか、左側から過去の会話を選択してください')).toBeVisible();
  });

  test('initial-003: スレッド一覧が表示される', async ({ page }) => {
    // "会話履歴" タイトルが表示されることを確認
    await expect(page.locator('.thread-list-title')).toBeVisible();
    await expect(page.locator('.thread-list-title')).toHaveText('会話履歴');

    // "新規会話" ボタンが表示されることを確認
    const newThreadButton = page.locator('button.new-thread-button');
    await expect(newThreadButton).toBeVisible();

    // 新規会話ボタンが有効であることを確認
    await expect(newThreadButton).toBeEnabled();
  });
});
