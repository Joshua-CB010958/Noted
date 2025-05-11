<script setup lang="ts">
import { ref, computed } from 'vue';
import { Note } from '../types';

const props = defineProps<{
  notes: Note[];
  selectedNoteId: string | undefined;
}>();

const emit = defineEmits<{
  (e: 'select-note', note: Note): void;
  (e: 'delete-note', id: string): void;
}>();

const searchQuery = ref('');

const filteredNotes = computed(() => {
  if (!searchQuery.value) return props.notes;
  
  const query = searchQuery.value.toLowerCase();
  return props.notes.filter(note => 
    note.title.toLowerCase().includes(query) || 
    note.content.toLowerCase().includes(query)
  );
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // If it's today, show time
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If it's this year, show month and day
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show full date
  return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

const selectNote = (note: Note) => {
  emit('select-note', note);
};

const deleteNote = (event: Event, id: string) => {
  event.stopPropagation();
  emit('delete-note', id);
};

const clearSearch = () => {
  searchQuery.value = '';
};
</script>

<template>
  <div class="note-list-container">
    <div class="search-container">
      <input 
        v-model="searchQuery" 
        class="search-input" 
        placeholder="Search notes..." 
      />
      <button 
        v-if="searchQuery" 
        class="clear-search" 
        @click="clearSearch"
      >
        ×
      </button>
    </div>
    
    <div class="notes-count">
      {{ filteredNotes.length }} {{ filteredNotes.length === 1 ? 'note' : 'notes' }}
    </div>
    
    <div class="note-list">
      <div 
        v-if="filteredNotes.length === 0" 
        class="empty-notes"
      >
        <p>No notes found</p>
      </div>
      
      <div 
        v-for="note in filteredNotes" 
        :key="note.id"
        :class="['note-item', { 'selected': note.id === selectedNoteId }]"
        @click="selectNote(note)"
      >
        <div class="note-info">
          <h3 class="note-title">{{ note.title }}</h3>
          <p class="note-preview">
            {{ note.content.replace(/#{1,6}\s+/g, '').substring(0, 60) }}...
          </p>
          <div class="note-meta">
            <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
        <button 
          class="delete-note" 
          @click="(event) => deleteNote(event, note.id)"
        >
          <span class="delete-icon">×</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-container {
  position: relative;
  padding: var(--spacing-4);
  padding-bottom: var(--spacing-2);
}

.search-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: border-color var(--transition-speed);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: var(--shadow-sm);
}

.clear-search {
  position: absolute;
  right: calc(var(--spacing-4) + var(--spacing-2));
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.clear-search:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.notes-count {
  padding: var(--spacing-2) var(--spacing-4);
  color: var(--text-tertiary);
  font-size: 0.8rem;
  border-bottom: 1px solid var(--border-color);
}

.note-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-2) 0;
}

.empty-notes {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: var(--text-tertiary);
  font-style: italic;
}

.note-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-color);
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

.note-item:hover {
  background-color: var(--bg-tertiary);
}

.note-item.selected {
  background-color: var(--primary-light);
  color: white;
}

.note-item.selected .note-meta {
  color: rgba(255, 255, 255, 0.8);
}

.note-info {
  flex: 1;
  min-width: 0; /* Enables text truncation */
}

.note-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-1) 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  font-size: 0.8rem;
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-item.selected .note-preview {
  color: rgba(255, 255, 255, 0.9);
}

.note-meta {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.delete-note {
  opacity: 0;
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: var(--spacing-1);
  margin-left: var(--spacing-2);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  min-width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-speed), color var(--transition-speed), opacity var(--transition-speed);
}

.note-item:hover .delete-note {
  opacity: 1;
}

.delete-note:hover {
  background-color: var(--error-color);
  color: white;
}

.delete-icon {
  font-size: 1.2rem;
  line-height: 1;
}

/* Animations for list items */
.note-item {
  animation: slideIn 0.3s ease-out forwards;
  animation-delay: calc(var(--index, 0) * 0.05s);
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>