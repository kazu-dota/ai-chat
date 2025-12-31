<template>
  <div class="markdown-content">
    <component
      v-for="(block, index) in parsedBlocks"
      :key="index"
      :is="block.type === 'code' ? CodeBlock : 'div'"
      v-bind="block.props"
      :class="{ 'markdown-text': block.type === 'markdown' }"
      v-html="block.type === 'markdown' ? block.content : undefined"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import CodeBlock from './CodeBlock.vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  }
})

// コードブロックとMarkdownテキストを分離してパース
const parsedBlocks = computed(() => {
  const blocks = []
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = codeBlockRegex.exec(props.content)) !== null) {
    // コードブロック前のMarkdownテキスト
    if (match.index > lastIndex) {
      const markdownText = props.content.slice(lastIndex, match.index)
      if (markdownText.trim()) {
        blocks.push({
          type: 'markdown',
          content: DOMPurify.sanitize(marked(markdownText))
        })
      }
    }

    // コードブロック
    const language = match[1] || 'plaintext'
    const code = match[2].trim()
    blocks.push({
      type: 'code',
      props: {
        code,
        language
      }
    })

    lastIndex = match.index + match[0].length
  }

  // 残りのMarkdownテキスト
  if (lastIndex < props.content.length) {
    const markdownText = props.content.slice(lastIndex)
    if (markdownText.trim()) {
      blocks.push({
        type: 'markdown',
        content: DOMPurify.sanitize(marked(markdownText))
      })
    }
  }

  return blocks
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
}

.markdown-text :deep(h1),
.markdown-text :deep(h2),
.markdown-text :deep(h3),
.markdown-text :deep(h4),
.markdown-text :deep(h5),
.markdown-text :deep(h6) {
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-text :deep(h1) {
  font-size: 2rem;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 0.3rem;
}

.markdown-text :deep(h2) {
  font-size: 1.5rem;
  border-bottom: 1px solid #e1e4e8;
  padding-bottom: 0.3rem;
}

.markdown-text :deep(h3) {
  font-size: 1.25rem;
}

.markdown-text :deep(h4) {
  font-size: 1rem;
}

.markdown-text :deep(p) {
  margin-top: 0;
  margin-bottom: 1rem;
}

.markdown-text :deep(ul),
.markdown-text :deep(ol) {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-text :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-text :deep(blockquote) {
  margin: 1rem 0;
  padding: 0 1rem;
  border-left: 4px solid #dfe2e5;
  color: #6a737d;
}

.markdown-text :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-text :deep(a:hover) {
  text-decoration: underline;
}

.markdown-text :deep(code) {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
}

.markdown-text :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.markdown-text :deep(th),
.markdown-text :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

.markdown-text :deep(th) {
  font-weight: 600;
  background-color: #f6f8fa;
}

.markdown-text :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>
