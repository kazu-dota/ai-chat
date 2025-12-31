import { test, expect } from '@playwright/test';
import { createTestThread } from './helpers/test-helpers.js';

test.describe('メッセージ送信デバッグ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('debug: メッセージ送信のステップバイステップ確認', async ({ page }) => {
    // テスト用スレッドを作成
    await createTestThread(page, '[TEST] デバッグ');

    // 初期状態を確認
    console.log('=== 初期状態 ===');
    const textarea = page.locator('textarea.chat-input');
    const sendButton = page.locator('button.send-button');

    console.log('Textarea visible:', await textarea.isVisible());
    console.log('Send button visible:', await sendButton.isVisible());
    console.log('Send button disabled (初期):', await sendButton.isDisabled());
    console.log('Textarea value (初期):', await textarea.inputValue());

    // メッセージを入力
    console.log('\n=== メッセージ入力 ===');
    const testMessage = 'こんにちは';

    // 方法1: fill を使用
    await textarea.fill(testMessage);
    await page.waitForTimeout(200);

    console.log('Textarea value (fill後):', await textarea.inputValue());
    console.log('Send button disabled (fill後):', await sendButton.isDisabled());

    // もし disabled なら、type を試す
    if (await sendButton.isDisabled()) {
      console.log('\nボタンがまだ disabled です。type を試します...');
      await textarea.clear();
      await textarea.type(testMessage);
      await page.waitForTimeout(200);

      console.log('Textarea value (type後):', await textarea.inputValue());
      console.log('Send button disabled (type後):', await sendButton.isDisabled());
    }

    // ボタンが有効になるまで待機（最大5秒）
    console.log('\n=== ボタンの有効化を待機 ===');
    try {
      await sendButton.waitFor({ state: 'attached', timeout: 1000 });
      console.log('Button attached');

      // disabled 属性が消えるまで待機
      await page.waitForFunction(() => {
        const btn = document.querySelector('button.send-button');
        return btn && !btn.disabled;
      }, { timeout: 5000 });

      console.log('ボタンが有効になりました');
    } catch (error) {
      console.log('エラー: ボタンが有効になりませんでした', error.message);

      // デバッグ情報を取得
      const buttonHTML = await sendButton.evaluate(el => el.outerHTML);
      console.log('Button HTML:', buttonHTML);

      const textareaValue = await textarea.evaluate(el => el.value);
      console.log('Textarea actual value:', textareaValue);

      throw error;
    }

    // 送信ボタンをクリック
    console.log('\n=== 送信ボタンをクリック ===');
    await sendButton.click();
    console.log('クリック完了');

    // メッセージが表示されるまで待機
    console.log('\n=== メッセージ表示を待機 ===');
    try {
      await page.waitForSelector('.message-user', { timeout: 5000 });
      console.log('✓ ユーザーメッセージが表示されました');

      const messageText = await page.locator('.message-user').first().textContent();
      console.log('メッセージ内容:', messageText);

      expect(messageText).toContain(testMessage);
    } catch (error) {
      console.log('エラー: メッセージが表示されませんでした');

      // DOM の状態を確認
      const messageCount = await page.locator('.message').count();
      console.log('Message count:', messageCount);

      const messagesHTML = await page.locator('.messages-container').innerHTML();
      console.log('Messages container HTML:', messagesHTML);

      throw error;
    }
  });
});
