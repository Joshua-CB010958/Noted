<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { Note } from '../types';

// Set up syntax highlighting for code blocks
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true
});

const props = defineProps<{
  note: Note;
}>();

const emit = defineEmits<{
  (e: 'update-note', note: Note): void;
}>();

const title = ref(props.note.title);
const content = ref(props.note.content);
const htmlContent = ref('');
const autoSaveTimeout = ref<number | null>(null);
const lastSaved = ref<Date | null>(null);
const isSaving = ref(false);

// Watch for changes in the note prop
watch(() => props.note, (newNote) => {
  title.value = newNote.title;
  content.value = newNote.content;
  renderMarkdown();
}, { deep: true });

// Watch for changes in the content
watch(content, () => {
  renderMarkdown();
  scheduleAutoSave();
});

// Watch for changes in the title
watch(title, () => {
  scheduleAutoSave();
});

onMounted(() => {
  renderMarkdown();
});

// Render the markdown content to HTML
const renderMarkdown = () => {
  try {
    // Convert markdown to HTML and sanitize to prevent XSS
    const rawHtml = marked(content.value);
    htmlContent.value = DOMPurify.sanitize(rawHtml);
  } catch (error) {
    console.error('Error rendering markdown:', error);
    htmlContent.value = '<p>Error rendering markdown</p>';
  }
};

// Schedule auto-save after typing stops
const scheduleAutoSave = () => {
  // Clear any existing timeout
  if (autoSaveTimeout.value) {
    window.clearTimeout(autoSaveTimeout.value);
  }
  
  // Set a new timeout to save after 1 second of inactivity
  autoSaveTimeout.value = window.setTimeout(() => {
    saveNote();
  }, 1000);
};

// Save the note
const saveNote = () => {
  if (title.value === props.note.title && content.value === props.note.content) {
    return; // No changes to save
  }
  
  isSaving.value = true;
  
  const updatedNote: Note = {
    ...props.note,
    title: title.value,
    content: content.value,
    updatedAt: new Date().toISOString()
  };
  
  emit('update-note', updatedNote);
  lastSaved.value = new Date();
  
  // Reset saving state after a short delay
  setTimeout(() => {
    isSaving.value = false;
  }, 500);
};

// Extract title from content (using first heading)
const extractTitleFromContent = () => {
  const titleMatch = content.value.match(/^# (.+)$/m);
  if (titleMatch && titleMatch[1]) {
    title.value = titleMatch[1];
  }
};
</script>

<template>
  <div class="editor-wrapper">
    <div class="editor-toolbar">
      <input 
        v-model="title" 
        class="title-input" 
        placeholder="Note title" 
      />
      <div class="save-status">
        <span v-if="isSaving" class="saving">Saving...</span>
        <span v-else-if="lastSaved" class="saved">
          Saved {{ new Date(lastSaved).toLocaleTimeString() }}
        </span>
      </div>
    </div>
    
    <div class="editor-container">
      <div class="input-pane">
        <textarea 
          v-model="content" 
          class="markdown-input" 
          placeholder="Write your note in Markdown..." 
          @blur="extractTitleFromContent"
        ></textarea>
      </div>
      
      <div class="preview-pane">
        <div class="markdown-preview" v-html="htmlContent"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
}

.title-input {
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  flex: 1;
  margin-right: var(--spacing-4);
  padding: var(--spacing-2);
}

.title-input:focus {
  outline: none;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.save-status {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  min-width: 100px;
  text-align: right;
}

.saving {
  color: var(--primary-color);
}

.saved {
  color: var(--success-color);
}

.editor-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.input-pane, .preview-pane {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-4);
}

.input-pane {
  border-right: 1px solid var(--border-color);
}

.markdown-input {
  width: 100%;
  height: 100%;
  border: none;
  background-color: transparent;
  color: var(--text-primary);
  font-family: 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  resize: none;
  padding: 0;
}

.markdown-input:focus {
  outline: none;
}

.markdown-preview {
  line-height: 1.6;
}

/* Style for markdown preview elements */
.markdown-preview :deep(h1) {
  font-size: 2rem;
  margin-top: 0;
  margin-bottom: var(--spacing-4);
  color: var(--text-primary);
}

.markdown-preview :deep(h2) {
  font-size: 1.5rem;
  margin-top: var(--spacing-6);
  margin-bottom: var(--spacing-3);
  color: var(--text-primary);
}

.markdown-preview :deep(h3) {
  font-size: 1.25rem;
  margin-top: var(--spacing-5);
  margin-bottom: var(--spacing-3);
  color: var(--text-primary);
}

.markdown-preview :deep(p) {
  margin-bottom: var(--spacing-4);
}

.markdown-preview :deep(ul), 
.markdown-preview :deep(ol) {
  margin-bottom: var(--spacing-4);
  padding-left: var(--spacing-5);
}

.markdown-preview :deep(li) {
  margin-bottom: var(--spacing-2);
}

.markdown-preview :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: var(--spacing-4);
  color: var(--text-secondary);
  margin: var(--spacing-4) 0;
}

.markdown-preview :deep(pre) {
  margin-bottom: var(--spacing-4);
  border-radius: var(--radius-md);
  background-color: var(--bg-tertiary);
  padding: var(--spacing-4);
  overflow-x: auto;
}

.markdown-preview :deep(code) {
  font-family: 'SF Mono', Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-preview :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
}

.markdown-preview :deep(a:hover) {
  text-decoration: underline;
}

.markdown-preview :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: var(--spacing-4);
}

.markdown-preview :deep(th),
.markdown-preview :deep(td) {
  border: 1px solid var(--border-color);
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
}

.markdown-preview :deep(th) {
  background-color: var(--bg-secondary);
}

/* Responsive styles */
@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  .input-pane, .preview-pane {
    flex: none;
    height: 50%;
  }
  
  .input-pane {
    border-right: none;
    border-bottom: 1px solid var(--border-color);
  }
}
</style>