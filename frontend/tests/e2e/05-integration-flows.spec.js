import { test, expect } from '@playwright/test';
import {
  createTestThread,
  sendMessage,
  updateThreadTitle,
  deleteThread,
  cleanupTestThreads,
  waitForPageLoad,
  getMessageCount
} from './helpers/test-helpers.js';

test.describe('統合フローテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test.afterEach(async ({ page }) => {
    await cleanupTestThreads(page);
  });

  test('flow-001: 新規会話を作成してメッセージを送信する完全フロー', async ({ page }) => {
    // 新規会話ボタンをクリック
    await page.click('button:has-text("新規会話")');
    await page.waitForURL(/\/thread\/[a-f0-9]+/);

    // メッセージ1を送信
    await sendMessage(page, 'こんにちは');

    // ユーザーメッセージとAI応答が表示されることを確認
    await expect(page.locator('.message-user:has-text("こんにちは")')).toBeVisible();
    await expect(page.locator('.message-assistant')).toBeVisible();

    // メッセージ2を送信
    await sendMessage(page, 'ありがとう');

    // 合計4つのメッセージが表示されることを確認（ユーザー2 + AI 2）
    expect(await getMessageCount(page)).toBe(4);

    // スレッドが一覧に表示されることを確認
    await expect(page.locator('.thread-item.active')).toBeVisible();
  });

  test('flow-002: スレッドを切り替えて過去のメッセージを表示', async ({ page }) => {
    // スレッドAを作成してメッセージ送信
    const threadIdA = await createTestThread(page, '[TEST] スレッドA');
    await sendMessage(page, 'スレッドAのメッセージ');

    // スレッドBを作成してメッセージ送信
    const threadIdB = await createTestThread(page, '[TEST] スレッドB');
    await sendMessage(page, 'スレッドBのメッセージ');

    // スレッドAに戻る
    await page.click(`.thread-item:has-text("[TEST] スレッドA")`);
    await page.waitForURL(`/thread/${threadIdA}`);

    // スレッドAのメッセージが表示されることを確認
    await expect(page.locator('.message-user:has-text("スレッドAのメッセージ")')).toBeVisible();

    // スレッドBのメッセージは表示されないことを確認
    await expect(page.locator('.message-user:has-text("スレッドBのメッセージ")')).not.toBeVisible();
  });

  test('flow-003: スレッドを削除して確認', async ({ page }) => {
    // スレッドを作成してメッセージ送信
    await createTestThread(page, '[TEST] 削除フロー');
    await sendMessage(page, 'テストメッセージ');

    // スレッドを削除
    await deleteThread(page, '[TEST] 削除フロー');

    // ホーム画面に戻ることを確認
    await expect(page.locator('text=AIチャットへようこそ')).toBeVisible();

    // スレッドが一覧から削除されていることを確認
    await expect(page.locator('.thread-item:has-text("[TEST] 削除フロー")')).not.toBeVisible();
  });

  test('flow-004: スレッドタイトルを編集して保存', async ({ page }) => {
    // スレッドを作成
    await createTestThread(page, '[TEST] 元のタイトル');

    // タイトルを編集
    await updateThreadTitle(page, '[TEST] 編集後のタイトル');

    // ページを再読み込み
    await page.reload();
    await waitForPageLoad(page);

    // 変更が保持されていることを確認
    await expect(page.locator('.thread-item.active .thread-title')).toHaveText('[TEST] 編集後のタイトル');
  });

  test('flow-005: 長い会話のフロー', async ({ page }) => {
    // スレッドを作成
    await createTestThread(page, '[TEST] 長い会話');

    // 5回メッセージを送信
    for (let i = 1; i <= 5; i++) {
      await sendMessage(page, `メッセージ ${i}`);
    }

    // 合計10個のメッセージが表示されることを確認（ユーザー5 + AI 5）
    expect(await getMessageCount(page)).toBe(10);

    // 最初のメッセージまでスクロールして確認
    const firstMessage = page.locator('.message-user:has-text("メッセージ 1")');
    await firstMessage.scrollIntoViewIfNeeded();
    await expect(firstMessage).toBeVisible();

    // 最後のメッセージも確認
    const lastMessage = page.locator('.message-user:has-text("メッセージ 5")');
    await lastMessage.scrollIntoViewIfNeeded();
    await expect(lastMessage).toBeVisible();
  });

  test('flow-006: Markdownを含む会話フロー', async ({ page }) => {
    // スレッドを作成
    await createTestThread(page, '[TEST] Markdown会話');

    // コードを含むメッセージを送信
    await sendMessage(page, 'Pythonの関数について説明して');

    // AI応答を待つ
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 60000 });

    // サンプルコードをリクエスト
    await sendMessage(page, 'サンプルコードも含めて');

    // コードブロックが表示されることを確認
    await expect(page.locator('.code-block').first()).toBeVisible({ timeout: 60000 });

    // コピーボタンをクリック
    const copyButton = page.locator('.copy-button').first();
    await copyButton.click();
    await expect(copyButton).toHaveText('Copied!');

    // 別のメッセージを送信
    await sendMessage(page, 'ありがとう');

    // 会話が継続していることを確認
    expect(await getMessageCount(page)).toBeGreaterThan(4);
  });

  test('flow-007: 複数スレッドの並行操作', async ({ page }) => {
    // スレッドA, B, Cを作成
    const threadIdA = await createTestThread(page, '[TEST] スレッドA');
    await sendMessage(page, 'Aのメッセージ', false);

    const threadIdB = await createTestThread(page, '[TEST] スレッドB');
    await sendMessage(page, 'Bのメッセージ', false);

    const threadIdC = await createTestThread(page, '[TEST] スレッドC');
    await sendMessage(page, 'Cのメッセージ', false);

    // スレッドAに切り替え
    await page.click(`.thread-item:has-text("[TEST] スレッドA")`);
    await page.waitForURL(`/thread/${threadIdA}`);

    // メッセージが混在していないことを確認
    await expect(page.locator('.message-user:has-text("Aのメッセージ")')).toBeVisible();
    await expect(page.locator('.message-user:has-text("Bのメッセージ")')).not.toBeVisible();
    await expect(page.locator('.message-user:has-text("Cのメッセージ")')).not.toBeVisible();

    // スレッドBに切り替え
    await page.click(`.thread-item:has-text("[TEST] スレッドB")`);
    await page.waitForURL(`/thread/${threadIdB}`);

    // スレッドBのメッセージのみ表示されることを確認
    await expect(page.locator('.message-user:has-text("Bのメッセージ")')).toBeVisible();
    await expect(page.locator('.message-user:has-text("Aのメッセージ")')).not.toBeVisible();
  });
});
