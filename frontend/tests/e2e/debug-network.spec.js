import { test, expect } from '@playwright/test';
import { createTestThread } from './helpers/test-helpers.js';

test.describe('ネットワークとコンソールのデバッグ', () => {
  test('debug: ネットワークリクエストとコンソールログを確認', async ({ page }) => {
    // コンソールログをキャプチャ
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // ネットワークリクエストをキャプチャ
    const networkRequests = [];
    page.on('request', request => {
      networkRequests.push({
        method: request.method(),
        url: request.url(),
        postData: request.postData()
      });
    });

    // レスポンスもキャプチャ
    const networkResponses = [];
    page.on('response', async response => {
      networkResponses.push({
        status: response.status(),
        url: response.url(),
        statusText: response.statusText()
      });
    });

    // ページエラーをキャプチャ
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // テスト用スレッドを作成
    console.log('=== スレッド作成 ===');
    await createTestThread(page, '[TEST] ネットワークデバッグ');
    console.log('スレッド作成完了');

    // メッセージを入力して送信
    console.log('\n=== メッセージ送信 ===');
    const textarea = page.locator('textarea.chat-input');
    const sendButton = page.locator('button.send-button');

    await textarea.fill('テストメッセージ');
    await page.waitForTimeout(200);

    // ボタンが有効になるまで待機
    await page.waitForFunction(() => {
      const btn = document.querySelector('button.send-button');
      return btn && !btn.disabled;
    }, { timeout: 5000 });

    console.log('送信ボタンをクリックします...');

    // リクエスト数をカウント
    const requestCountBefore = networkRequests.length;

    await sendButton.click();
    console.log('クリック完了');

    // 少し待ってネットワークアクティビティを確認
    await page.waitForTimeout(3000);

    const requestCountAfter = networkRequests.length;

    // ログ出力
    console.log('\n=== コンソールログ ===');
    consoleLogs.forEach(log => console.log(log));

    console.log('\n=== ページエラー ===');
    if (pageErrors.length === 0) {
      console.log('ページエラーなし');
    } else {
      pageErrors.forEach(error => console.log(error));
    }

    console.log('\n=== クリック後のネットワークリクエスト ===');
    console.log(`リクエスト数（クリック前）: ${requestCountBefore}`);
    console.log(`リクエスト数（クリック後）: ${requestCountAfter}`);

    if (requestCountAfter > requestCountBefore) {
      console.log('新しいリクエストが送信されました:');
      networkRequests.slice(requestCountBefore).forEach(req => {
        console.log(`  ${req.method} ${req.url}`);
        if (req.postData) {
          console.log(`  Body: ${req.postData}`);
        }
      });
    } else {
      console.log('❌ クリック後に新しいリクエストが送信されていません');
    }

    console.log('\n=== クリック後のレスポンス ===');
    if (networkResponses.length > 0) {
      networkResponses.slice(-5).forEach(res => {
        console.log(`  ${res.status} ${res.url}`);
      });
    }

    // バックエンドの状態を確認
    console.log('\n=== バックエンド接続確認 ===');
    try {
      const healthResponse = await page.request.get('http://localhost:5001/api/health');
      console.log(`バックエンド Health Check: ${healthResponse.status()}`);
      const healthData = await healthResponse.json();
      console.log('Health data:', healthData);
    } catch (error) {
      console.log('❌ バックエンドに接続できません:', error.message);
    }
  });
});
