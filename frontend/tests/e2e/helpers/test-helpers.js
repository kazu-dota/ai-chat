/**
 * E2Eテスト用ヘルパー関数
 */

/**
 * テスト用スレッドを作成
 * @param {import('@playwright/test').Page} page
 * @param {string} title - スレッドタイトル（デフォルト: [TEST] テストスレッド）
 * @returns {Promise<string>} 作成されたスレッドのID
 */
export async function createTestThread(page, title = '[TEST] テストスレッド') {
  // 新規会話ボタンを待機してクリック
  const newThreadButton = page.locator('button.new-thread-button');
  await newThreadButton.waitFor({ state: 'visible', timeout: 10000 });
  await newThreadButton.click();

  // スレッドが作成されるまで待機
  await page.waitForURL(/\/thread\/[a-f0-9]+/, { timeout: 10000 });

  // URLからスレッドIDを取得
  const url = page.url();
  const threadId = url.match(/\/thread\/([a-f0-9]+)/)[1];

  // 空メッセージ画面が表示されるまで待機
  await page.waitForSelector('text=まだメッセージがありません', { timeout: 5000 }).catch(() => {});

  // タイトルが指定されている場合は変更
  if (title !== '新しい会話') {
    await updateThreadTitle(page, title);
  }

  return threadId;
}

/**
 * スレッドタイトルを更新
 * @param {import('@playwright/test').Page} page
 * @param {string} newTitle - 新しいタイトル
 */
export async function updateThreadTitle(page, newTitle) {
  // 編集ボタンをクリック
  await page.click('button[title="タイトルを編集"]');

  // モーダルが表示されるまで待機
  await page.waitForSelector('input.title-input');

  // タイトルを入力
  await page.fill('input.title-input', newTitle);

  // 保存ボタンをクリック
  await page.click('text=保存');

  // モーダルが閉じるまで待機
  await page.waitForSelector('input.title-input', { state: 'hidden' });
}

/**
 * メッセージを送信
 * @param {import('@playwright/test').Page} page
 * @param {string} message - 送信するメッセージ
 * @param {boolean} waitForResponse - AI応答を待つかどうか（デフォルト: true）
 */
export async function sendMessage(page, message, waitForResponse = true) {
  // 現在のメッセージ数を取得
  const initialMessageCount = await page.locator('.message').count();

  // メッセージを入力
  await page.fill('textarea.chat-input', message);

  // 少し待機して入力が反映されるのを確認
  await page.waitForTimeout(100);

  // 送信ボタンをクリック
  await page.click('button.send-button');

  // ユーザーメッセージが表示されるまで待機
  await page.waitForSelector('.message-user', { timeout: 10000 });

  if (waitForResponse) {
    // AI応答が表示されるまで待機（最大90秒）
    // メッセージ数が2つ増えるまで待つ（ユーザー + AI）
    await page.waitForFunction(
      (initialCount) => {
        const currentCount = document.querySelectorAll('.message').length;
        return currentCount >= initialCount + 2;
      },
      initialMessageCount,
      { timeout: 90000 }
    );

    // ローディングが完了するまで待機（送信ボタンのloading状態が解除される）
    await page.waitForFunction(() => {
      const button = document.querySelector('button.send-button');
      return button && !button.classList.contains('loading');
    }, { timeout: 15000 });
  }
}

/**
 * スレッドを選択
 * @param {import('@playwright/test').Page} page
 * @param {string} threadId - スレッドID
 */
export async function selectThread(page, threadId) {
  await page.click(`.thread-item[data-thread-id="${threadId}"]`);
  await page.waitForURL(`/thread/${threadId}`);
}

/**
 * スレッドを削除
 * @param {import('@playwright/test').Page} page
 * @param {string} threadTitle - 削除するスレッドのタイトル
 */
export async function deleteThread(page, threadTitle) {
  // スレッドアイテムを探す
  const threadItem = page.locator('.thread-item', { hasText: threadTitle });

  // スレッドにホバーして削除ボタンを表示
  await threadItem.hover();

  // 削除ボタンをクリック
  await threadItem.locator('button.delete-button').click();

  // 確認モーダルの「削除する」ボタンをクリック
  await page.click('button.button-danger:has-text("削除する")');

  // スレッドが削除されるまで待機
  await page.waitForSelector(`.thread-item:has-text("${threadTitle}")`, { state: 'detached' });
}

/**
 * テスト用のスレッドをすべて削除（クリーンアップ）
 * @param {import('@playwright/test').Page} page
 */
export async function cleanupTestThreads(page) {
  try {
    // ホームページに移動
    await page.goto('/', { waitUntil: 'networkidle', timeout: 10000 });

    // 少し待機してスレッド一覧がロードされるのを待つ
    await page.waitForTimeout(1000);

    // [TEST]で始まるスレッドを全て取得
    const testThreads = await page.locator('.thread-item:has-text("[TEST]")').all();

    // 各テストスレッドを削除
    for (const thread of testThreads) {
      try {
        await thread.hover({ timeout: 3000 });
        const deleteButton = thread.locator('button.delete-button');
        await deleteButton.click({ timeout: 3000 });

        // モーダルが表示されるまで待機
        await page.waitForSelector('button.button-danger:has-text("削除する")', { timeout: 3000 });
        await page.click('button.button-danger:has-text("削除する")');

        // 削除処理の完了を待つ
        await page.waitForTimeout(1000);
      } catch (error) {
        // エラーが発生しても続行
        console.log('Failed to delete test thread:', error.message);
      }
    }
  } catch (error) {
    console.log('Cleanup failed:', error.message);
  }
}

/**
 * 特定のメッセージが表示されるまで待機
 * @param {import('@playwright/test').Page} page
 * @param {string} text - 待機するテキスト
 * @param {string} role - メッセージの役割（'user' または 'assistant'）
 */
export async function waitForMessage(page, text, role = 'assistant') {
  await page.waitForSelector(`.message-${role}:has-text("${text}")`);
}

/**
 * メッセージの数を取得
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
export async function getMessageCount(page) {
  return await page.locator('.message').count();
}

/**
 * スレッドの数を取得
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<number>}
 */
export async function getThreadCount(page) {
  return await page.locator('.thread-item').count();
}

/**
 * ページが完全に読み込まれるまで待機
 * @param {import('@playwright/test').Page} page
 */
export async function waitForPageLoad(page) {
  await page.waitForLoadState('networkidle');
}

/**
 * エラーメッセージが表示されているか確認
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<boolean>}
 */
export async function hasErrorMessage(page) {
  return await page.locator('.error-message').isVisible();
}

/**
 * モバイルビューに切り替え
 * @param {import('@playwright/test').Page} page
 */
export async function switchToMobileView(page) {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * デスクトップビューに切り替え
 * @param {import('@playwright/test').Page} page
 */
export async function switchToDesktopView(page) {
  await page.setViewportSize({ width: 1280, height: 720 });
}
