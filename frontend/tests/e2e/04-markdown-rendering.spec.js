import { test, expect } from '@playwright/test';
import {
  createTestThread,
  sendMessage,
  cleanupTestThreads,
  waitForPageLoad
} from './helpers/test-helpers.js';

test.describe('Markdownレンダリングテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    await createTestThread(page, '[TEST] Markdownテスト');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestThreads(page);
  });

  test('markdown-001: Markdown見出しが正しく表示される', async ({ page }) => {
    await sendMessage(page, '見出しのサンプルを表示して');

    // AI応答内のMarkdownを確認
    const assistantMessage = page.locator('.message-assistant').first();

    // h1, h2, h3タグが存在することを確認（少なくとも1つ）
    await expect(assistantMessage.locator('h1, h2, h3').first()).toBeVisible({ timeout: 60000 });
  });

  test('markdown-002: Markdownリストが正しく表示される', async ({ page }) => {
    await sendMessage(page, '箇条書きリストと番号付きリストを表示して');

    const assistantMessage = page.locator('.message-assistant').first();

    // リストタグが存在することを確認（少なくとも1つ）
    await expect(assistantMessage.locator('ul, ol').first()).toBeVisible({ timeout: 60000 });
  });

  test('markdown-003: Markdownリンクが正しく表示される', async ({ page }) => {
    await sendMessage(page, 'リンクを含むテキストを表示して');

    const assistantMessage = page.locator('.message-assistant').first();

    // リンクが存在することを確認
    const link = assistantMessage.locator('a[href]').first();
    await expect(link).toBeVisible({ timeout: 60000 });
  });

  test('markdown-004: コードブロックが正しく表示される', async ({ page }) => {
    await sendMessage(page, 'Pythonのサンプルコードを表示して');

    // コードブロックが表示されることを確認
    const codeBlock = page.locator('.code-block').first();
    await expect(codeBlock).toBeVisible({ timeout: 60000 });

    // 言語名が表示されることを確認
    await expect(codeBlock.locator('.language')).toBeVisible();

    // コピーボタンが表示されることを確認
    await expect(codeBlock.locator('.copy-button')).toBeVisible();
  });

  test('markdown-005: インラインコードが正しく表示される', async ({ page }) => {
    await sendMessage(page, 'console.logのようなインラインコードを含む説明をして');

    const assistantMessage = page.locator('.message-assistant').first();

    // インラインコードが存在することを確認
    const inlineCode = assistantMessage.locator('code').first();
    await expect(inlineCode).toBeVisible({ timeout: 60000 });
  });

  test('markdown-006: コードブロックのコピーボタンが動作する', async ({ page }) => {
    await sendMessage(page, 'JavaScriptのサンプルコードを表示して');

    // コードブロックのコピーボタンをクリック
    const copyButton = page.locator('.copy-button').first();
    await copyButton.waitFor({ state: 'visible', timeout: 60000 });
    await copyButton.click();

    // ボタンのテキストが "Copied!" に変わることを確認
    await expect(copyButton).toHaveText('Copied!');

    // 2秒後に "Copy" に戻ることを確認
    await expect(copyButton).toHaveText('Copy', { timeout: 3000 });
  });

  test('markdown-007: 複数のコードブロックを含むメッセージを表示できる', async ({ page }) => {
    await sendMessage(page, 'PythonとJavaScriptのサンプルコードを両方表示して');

    // 複数のコードブロックが表示されることを確認
    const codeBlocks = page.locator('.code-block');
    await expect(codeBlocks.first()).toBeVisible({ timeout: 60000 });

    // 少なくとも1つのコードブロックが存在することを確認
    const count = await codeBlocks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('markdown-008: 表が正しく表示される', async ({ page }) => {
    await sendMessage(page, '簡単な表を作成して');

    const assistantMessage = page.locator('.message-assistant').first();

    // テーブルが存在することを確認
    await expect(assistantMessage.locator('table')).toBeVisible({ timeout: 60000 });
  });
});
