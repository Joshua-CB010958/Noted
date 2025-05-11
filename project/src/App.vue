<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import Header from './components/Header.vue';
import NoteEditor from './components/NoteEditor.vue';
import NoteList from './components/NoteList.vue';
import { Note } from './types';
import { fetchNotes, createNote, updateNote, deleteNote } from './services/noteService';

const notes = ref<Note[]>([]);
const selectedNote = ref<Note | null>(null);
const isLoading = ref<boolean>(true);
const error = ref<string | null>(null);
const darkMode = ref<boolean>(false);

// Apply the theme and persist it
function applyTheme(mode: boolean) {
  darkMode.value = mode;
  const root = document.documentElement;

  if (mode) {
    root.classList.add('dark-mode');
  } else {
    root.classList.remove('dark-mode');
  }

  localStorage.setItem('theme', mode ? 'dark' : 'light');
}

// Toggle dark mode manually
const toggleDarkMode = () => {
  applyTheme(!darkMode.value);
};

// Load theme preference and notes
onMounted(() => {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (stored === 'dark') {
    applyTheme(true);
  } else if (stored === 'light') {
    applyTheme(false);
  } else {
    applyTheme(prefersDark);
  }

  loadNotes();
});

// Load notes from the API
const loadNotes = async () => {
  try {
    isLoading.value = true;
    notes.value = await fetchNotes();
  } catch (err) {
    error.value = 'Failed to load notes. Please try again later.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

// Create a new note
const handleCreateNote = async () => {
  try {
    const newNote: Omit<Note, 'id'> = {
      title: 'Untitled Note',
      content: '# Untitled Note\n\nStart writing...',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createdNote = await createNote(newNote);
    notes.value = [createdNote, ...notes.value];
    selectedNote.value = createdNote;
  } catch (err) {
    error.value = 'Failed to create note. Please try again.';
    console.error(err);
  }
};

// Update an existing note
const handleUpdateNote = async (updatedNote: Note) => {
  try {
    const updated = await updateNote(updatedNote);
    notes.value = notes.value.map(note => note.id === updated.id ? updated : note);
    selectedNote.value = updated;
  } catch (err) {
    error.value = 'Failed to update note. Please try again.';
    console.error(err);
  }
};

// Delete a note
const handleDeleteNote = async (id: string) => {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    await deleteNote(id);
    notes.value = notes.value.filter(note => note.id !== id);

    if (selectedNote.value?.id === id) {
      selectedNote.value = notes.value.length > 0 ? notes.value[0] : null;
    }
  } catch (err) {
    error.value = 'Failed to delete note. Please try again.';
    console.error(err);
  }
};

// Select a note for editing
const handleSelectNote = (note: Note) => {
  selectedNote.value = note;
};

// Clear error after 5 seconds
watch(error, (value) => {
  if (value) {
    setTimeout(() => {
      error.value = null;
    }, 5000);
  }
});
</script>

<template>
  <div class="app-container">
    <Header 
      :isDarkMode="darkMode" 
      @toggle-dark-mode="toggleDarkMode" 
      @create-note="handleCreateNote" 
    />
    
    <main>
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Loading notes...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="app-layout">
        <aside class="sidebar">
          <NoteList 
            :notes="notes" 
            :selectedNoteId="selectedNote?.id" 
            @select-note="handleSelectNote"
            @delete-note="handleDeleteNote"
          />
          
          <button 
            class="new-note-button"
            @click="handleCreateNote"
          >
            <span class="icon">+</span>
            New Note
          </button>
        </aside>
        
        <div class="editor-container">
          <NoteEditor 
            v-if="selectedNote" 
            :note="selectedNote" 
            @update-note="handleUpdateNote" 
          />
          
          <div v-else class="empty-state">
            <div class="empty-state-content">
              <h2>No Note Selected</h2>
              <p>Select a note from the sidebar or create a new one to get started.</p>
              <button @click="handleCreateNote">Create Note</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

main {
  flex: 1;
  padding: var(--spacing-4);
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.app-layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  height: calc(100vh - 80px);
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.sidebar {
  width: 300px;
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-container {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.new-note-button {
  margin: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
}

.icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-tertiary);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-4);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background-color: var(--error-color);
  color: white;
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  animation: slideIn 0.3s ease-out;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: var(--spacing-8);
  text-align: center;
  color: var(--text-tertiary);
}

.empty-state-content {
  max-width: 400px;
}

.empty-state-content h2 {
  margin-bottom: var(--spacing-4);
  color: var(--text-secondary);
}

.empty-state-content p {
  margin-bottom: var(--spacing-6);
}

/* Responsive styles */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--border-color);
    max-height: 300px;
  }
  
  .editor-container {
    height: calc(100vh - 380px);
  }
}
</style>