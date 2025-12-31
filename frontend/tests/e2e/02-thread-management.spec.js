import { test, expect } from '@playwright/test';
import {
  createTestThread,
  updateThreadTitle,
  deleteThread,
  cleanupTestThreads,
  waitForPageLoad,
  getThreadCount
} from './helpers/test-helpers.js';

test.describe('スレッド管理テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test.afterEach(async ({ page }) => {
    // テスト後のクリーンアップ
    await cleanupTestThreads(page);
  });

  test('thread-001: 新規スレッドを作成できる', async ({ page }) => {
    // 新規会話ボタンをクリック
    await page.click('button.new-thread-button');

    // URLが変更されることを確認
    await page.waitForURL(/\/thread\/[a-f0-9]+/, { timeout: 10000 });

    // 新しいスレッドが選択状態になっていることを確認
    const activeThread = page.locator('.thread-item.active');
    await expect(activeThread).toBeVisible({ timeout: 5000 });
    await expect(activeThread).toContainText('新しい会話');

    // 空のチャット画面が表示されることを確認
    await expect(page.locator('text=まだメッセージがありません')).toBeVisible({ timeout: 5000 });
  });

  test('thread-002: スレッドを選択できる', async ({ page }) => {
    // テスト用スレッドを2つ作成
    const threadId1 = await createTestThread(page, '[TEST] スレッド1');
    const threadId2 = await createTestThread(page, '[TEST] スレッド2');

    // スレッド1を選択
    await page.click(`.thread-item:has-text("[TEST] スレッド1")`);
    await page.waitForURL(`/thread/${threadId1}`);

    // スレッド1がアクティブになっていることを確認
    const activeThread1 = page.locator('.thread-item.active');
    await expect(activeThread1).toHaveText(/\[TEST\] スレッド1/);

    // スレッド2を選択
    await page.click(`.thread-item:has-text("[TEST] スレッド2")`);
    await page.waitForURL(`/thread/${threadId2}`);

    // スレッド2がアクティブになっていることを確認
    const activeThread2 = page.locator('.thread-item.active');
    await expect(activeThread2).toHaveText(/\[TEST\] スレッド2/);
  });

  test('thread-003: スレッドタイトルを編集できる', async ({ page }) => {
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] 元のタイトル');

    // 編集ボタンをクリック
    await page.click('button[title="タイトルを編集"]');

    // モーダルが表示されることを確認
    await expect(page.locator('h3:has-text("タイトルを編集")')).toBeVisible();

    // 現在のタイトルが入力欄に表示されていることを確認
    const titleInput = page.locator('input.title-input');
    await expect(titleInput).toHaveValue('[TEST] 元のタイトル');

    // 新しいタイトルを入力
    await titleInput.fill('[TEST] 新しいタイトル');

    // 保存ボタンをクリック
    await page.click('button.button-primary:has-text("保存")');

    // モーダルが閉じることを確認
    await expect(page.locator('h3:has-text("タイトルを編集")')).not.toBeVisible();

    // ヘッダーのタイトルが更新されることを確認
    await expect(page.locator('.chat-title')).toHaveText('[TEST] 新しいタイトル');

    // スレッド一覧のタイトルも更新されることを確認
    await expect(page.locator('.thread-item.active .thread-title')).toHaveText('[TEST] 新しいタイトル');
  });

  test('thread-004: スレッドタイトル編集をキャンセルできる', async ({ page }) => {
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] キャンセルテスト');

    // 編集ボタンをクリック
    await page.click('button[title="タイトルを編集"]');

    // タイトルを変更
    await page.fill('input.title-input', '[TEST] 変更後');

    // キャンセルボタンをクリック
    await page.click('button.button-secondary:has-text("キャンセル")');

    // モーダルが閉じることを確認
    await expect(page.locator('h3:has-text("タイトルを編集")')).not.toBeVisible();

    // タイトルが変更されていないことを確認
    await expect(page.locator('.chat-title')).toHaveText('[TEST] キャンセルテスト');
  });

  test('thread-005: スレッド削除時に確認モーダルが表示される', async ({ page }) => {
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] 削除テスト');

    // スレッドアイテムにホバー
    const threadItem = page.locator('.thread-item:has-text("[TEST] 削除テスト")');
    await threadItem.hover();

    // 削除ボタンが表示されることを確認
    const deleteButton = threadItem.locator('button.delete-button');
    await expect(deleteButton).toBeVisible();

    // 削除ボタンをクリック
    await deleteButton.click();

    // 確認モーダルが表示されることを確認
    await expect(page.locator('h3:has-text("会話の削除")')).toBeVisible();
    await expect(page.locator('text=この会話を削除してもよろしいですか？')).toBeVisible();
    await expect(page.locator('text=この操作は取り消せません。')).toBeVisible();

    // キャンセルと削除ボタンが表示されることを確認
    await expect(page.locator('button:has-text("キャンセル")')).toBeVisible();
    await expect(page.locator('button:has-text("削除する")')).toBeVisible();

    // キャンセルして閉じる
    await page.click('button:has-text("キャンセル")');
  });

  test('thread-006: スレッドを削除できる', async ({ page }) => {
    // 現在のスレッド数を取得
    const initialCount = await getThreadCount(page);

    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] 削除実行');

    // スレッド数が1つ増えたことを確認
    expect(await getThreadCount(page)).toBe(initialCount + 1);

    // スレッドを削除
    await deleteThread(page, '[TEST] 削除実行');

    // スレッド数が元に戻ったことを確認
    expect(await getThreadCount(page)).toBe(initialCount);

    // ホーム画面に戻ることを確認
    await expect(page.locator('text=AIチャットへようこそ')).toBeVisible();
  });

  test('thread-007: スレッド削除をキャンセルできる', async ({ page }) => {
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] キャンセル削除');

    // 現在のスレッド数を取得
    const initialCount = await getThreadCount(page);

    // スレッドアイテムにホバー
    const threadItem = page.locator('.thread-item:has-text("[TEST] キャンセル削除")');
    await threadItem.hover();

    // 削除ボタンをクリック
    await threadItem.locator('button.delete-button').click();

    // キャンセルボタンをクリック
    await page.click('button:has-text("キャンセル")');

    // モーダルが閉じることを確認
    await expect(page.locator('h3:has-text("会話の削除")')).not.toBeVisible();

    // スレッドが削除されていないことを確認
    await expect(threadItem).toBeVisible();
    expect(await getThreadCount(page)).toBe(initialCount);
  });
});
