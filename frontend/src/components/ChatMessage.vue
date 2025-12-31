<template>
  <div class="message" :class="[`message-${message.role}`]">
    <div class="message-avatar">
      <span class="avatar-icon">{{ message.role === 'user' ? '👤' : '🤖' }}</span>
    </div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-role">{{ message.role === 'user' ? 'You' : 'AI Assistant' }}</span>
        <span class="message-time">{{ formattedTime }}</span>
      </div>
      <div class="message-body">
        <MarkdownRenderer :content="message.content" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownRenderer from './MarkdownRenderer.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})

const formattedTime = computed(() => {
  const date = new Date(props.message.created_at)
  return date.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<style scoped>
.message {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  flex-shrink: 0;
}

.avatar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.25rem;
}

.message-user .avatar-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-assistant .avatar-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.message-role {
  font-weight: 600;
  color: #1a1a1a;
}

.message-time {
  font-size: 0.875rem;
  color: #6a737d;
}

.message-body {
  padding: 1rem;
  border-radius: 12px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-user .message-body {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
}

.message-assistant .message-body {
  background: #ffffff;
  border: 1px solid #e1e4e8;
}

@media (max-width: 768px) {
  .message {
    gap: 0.75rem;
  }

  .avatar-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }

  .message-body {
    padding: 0.75rem;
  }
}
</style>
