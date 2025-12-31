import { test, expect } from '@playwright/test';
import {
  createTestThread,
  sendMessage,
  cleanupTestThreads,
  waitForPageLoad,
  getMessageCount
} from './helpers/test-helpers.js';

test.describe('メッセージ送受信テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] メッセージテスト');
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestThreads(page);
  });

  test('message-001: メッセージを入力できる', async ({ page }) => {
    const testMessage = 'テストメッセージ';

    // メッセージを入力
    await page.fill('textarea.chat-input', testMessage);

    // 入力されたテキストが表示されることを確認
    await expect(page.locator('textarea.chat-input')).toHaveValue(testMessage);

    // 送信ボタンが有効になることを確認
    await expect(page.locator('button.send-button')).toBeEnabled();
  });

  test('message-002: Enterキーでメッセージを送信できる', async ({ page }) => {
    const testMessage = 'こんにちは';

    // メッセージを入力
    await page.fill('textarea.chat-input', testMessage);

    // Enterキーを押す
    await page.press('textarea.chat-input', 'Enter');

    // 入力欄がクリアされることを確認
    await expect(page.locator('textarea.chat-input')).toHaveValue('');

    // ユーザーメッセージが表示されることを確認
    await expect(page.locator('.message-user:has-text("こんにちは")')).toBeVisible();

    // AI応答が表示されることを確認（最大60秒待機）
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 60000 });
  });

  test('message-003: 送信ボタンでメッセージを送信できる', async ({ page }) => {
    const testMessage = 'ボタンテスト';

    // メッセージを入力
    await page.fill('textarea.chat-input', testMessage);

    // 送信ボタンをクリック
    await page.click('button.send-button:not(:disabled)');

    // 入力欄がクリアされることを確認
    await expect(page.locator('textarea.chat-input')).toHaveValue('');

    // ユーザーメッセージが表示されることを確認
    await expect(page.locator('.message-user:has-text("ボタンテスト")')).toBeVisible();

    // AI応答が表示されることを確認
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 60000 });
  });

  test('message-004: Shift+Enterで改行できる', async ({ page }) => {
    // テキストを入力
    await page.fill('textarea.chat-input', '1行目');

    // Shift+Enterを押す
    await page.press('textarea.chat-input', 'Shift+Enter');

    // さらにテキストを入力
    await page.type('textarea.chat-input', '2行目');

    // 複数行のテキストが入力されることを確認
    const value = await page.locator('textarea.chat-input').inputValue();
    expect(value).toContain('1行目');
    expect(value).toContain('2行目');
    // 改行が含まれていることを確認（末尾の空行は許容）
    expect(value.split('\n').length).toBeGreaterThanOrEqual(2);

    // メッセージが送信されていないことを確認（メッセージがない状態）
    await expect(page.locator('.message-user')).not.toBeVisible();
  });

  test('message-005: 空のメッセージは送信できない', async ({ page }) => {
    // 送信ボタンが無効であることを確認
    await expect(page.locator('button.send-button')).toBeDisabled();

    // 空白のみを入力
    await page.fill('textarea.chat-input', '   ');

    // 送信ボタンが無効のままであることを確認
    await expect(page.locator('button.send-button')).toBeDisabled();
  });

  test('message-006: ユーザーとAIのメッセージが区別して表示される', async ({ page }) => {
    await sendMessage(page, 'こんにちは');

    // ユーザーメッセージを確認
    const userMessage = page.locator('.message-user').first();
    await expect(userMessage.locator('text=You')).toBeVisible();
    await expect(userMessage.locator('.avatar-icon')).toBeVisible();
    await expect(userMessage.locator('.message-time')).toBeVisible();

    // AIメッセージを確認
    const assistantMessage = page.locator('.message-assistant').first();
    await expect(assistantMessage.locator('text=AI Assistant')).toBeVisible();
    await expect(assistantMessage.locator('.avatar-icon')).toBeVisible();
    await expect(assistantMessage.locator('.message-time')).toBeVisible();
  });

  test('message-007: AI（Gemini）から応答を受信できる', async ({ page }) => {
    await sendMessage(page, 'こんにちは');

    // AI応答が表示されることを確認
    const assistantMessage = page.locator('.message-assistant').first();
    await expect(assistantMessage).toBeVisible();

    // 応答内容が空でないことを確認
    const messageContent = await assistantMessage.locator('.message-body').textContent();
    expect(messageContent.length).toBeGreaterThan(0);
  });

  test('message-008: 複数のメッセージを連続で送信できる', async ({ page }) => {
    // 初期メッセージ数を確認
    const initialCount = await getMessageCount(page);

    // メッセージ1を送信
    await sendMessage(page, '1つ目のメッセージ');

    // メッセージ2を送信
    await sendMessage(page, '2つ目のメッセージ');

    // メッセージ数が増えていることを確認（ユーザー2 + AI 2 = 4メッセージ増加）
    const finalCount = await getMessageCount(page);
    expect(finalCount).toBe(initialCount + 4);

    // メッセージが正しい順序で表示されることを確認
    const messages = page.locator('.message');
    await expect(messages.nth(initialCount)).toHaveClass(/message-user/);
    await expect(messages.nth(initialCount + 1)).toHaveClass(/message-assistant/);
    await expect(messages.nth(initialCount + 2)).toHaveClass(/message-user/);
    await expect(messages.nth(initialCount + 3)).toHaveClass(/message-assistant/);
  });
});
