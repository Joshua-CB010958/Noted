<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

const props = defineProps<{
  isDarkMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-dark-mode'): void;
  (e: 'create-note'): void;
}>();

const toggleDarkMode = () => {
  emit('toggle-dark-mode');
};

const createNote = () => {
  emit('create-note');
};
</script>

<template>
  <header :class="{ 'dark': isDarkMode }">
    <div class="header-content">
      <div class="logo">
        <h1>Markdown Notes</h1>
      </div>
      <div class="actions">
        <button class="action-button" @click="createNote">
          <span class="icon">+</span>
          New Note
        </button>
        <button class="theme-toggle" @click="toggleDarkMode">
          <span v-if="isDarkMode" class="icon">☀️</span>
          <span v-else class="icon">🌙</span>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: var(--bg-primary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  padding: var(--spacing-4) var(--spacing-6);
  transition: background-color var(--transition-speed), box-shadow var(--transition-speed);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.logo h1 {
  font-size: 1.5rem;
  margin: 0;
  color: var(--primary-color);
}

.actions {
  display: flex;
  gap: var(--spacing-3);
  align-items: center;
}

.action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  background-color: var(--primary-color);
  color: white;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color var(--transition-speed);
}

.action-button:hover {
  background-color: var(--primary-dark);
}

.theme-toggle {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: var(--spacing-2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

.theme-toggle:hover {
  background-color: var(--bg-tertiary);
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  header {
    padding: var(--spacing-3) var(--spacing-4);
  }
  
  .logo h1 {
    font-size: 1.25rem;
  }
  
  .action-button span:not(.icon) {
    display: none;
  }
}
</style>