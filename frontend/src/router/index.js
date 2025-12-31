/**
 * Vue Router設定
 * アプリケーションのルーティングを管理
 */
import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'

const routes = [
  {
    path: '/',
    name: 'chat',
    component: ChatView,
    meta: {
      title: 'AIチャット'
    }
  },
  {
    path: '/thread/:threadId',
    name: 'thread',
    component: ChatView,
    props: true,
    meta: {
      title: 'AIチャット'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ページタイトルの設定
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'AIチャット'
  next()
})

export default router
