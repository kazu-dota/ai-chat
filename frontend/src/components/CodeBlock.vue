<template>
  <div class="code-block">
    <div class="code-header">
      <span class="language">{{ language }}</span>
      <button @click="copyCode" class="copy-button" :class="{ copied }">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <pre><code :class="`language-${language}`" ref="codeElement" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'plaintext'
  }
})

const codeElement = ref(null)
const copied = ref(false)

const highlightedCode = computed(() => {
  try {
    if (props.language === 'plaintext') {
      return hljs.highlightAuto(props.code).value
    }
    return hljs.highlight(props.code, { language: props.language }).value
  } catch (error) {
    console.error('Highlight error:', error)
    return props.code
  }
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Copy failed:', error)
  }
}

onMounted(() => {
  if (codeElement.value) {
    hljs.highlightElement(codeElement.value)
  }
})
</script>

<style scoped>
.code-block {
  margin: 1rem 0;
  border-radius: 8px;
  overflow: hidden;
  background: #0d1117;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.language {
  color: #8b949e;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
}

.copy-button {
  padding: 0.25rem 0.75rem;
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.copy-button:hover {
  background: #30363d;
  border-color: #8b949e;
}

.copy-button.copied {
  background: #238636;
  border-color: #238636;
  color: white;
}

pre {
  margin: 0;
  padding: 1rem;
  overflow-x: auto;
}

code {
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
