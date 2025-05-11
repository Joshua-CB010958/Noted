import axios from 'axios';
import { Note } from '../types';

const API_URL = 'http://localhost:3000/api/notes';

// Fetch all notes
export const fetchNotes = async (): Promise<Note[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    throw error;
  }
};

// Create a new note
export const createNote = async (note: Omit<Note, 'id'>): Promise<Note> => {
  try {
    const response = await axios.post(API_URL, note);
    return response.data;
  } catch (error) {
    console.error('Failed to create note:', error);
    throw error;
  }
};

// Update an existing note
export const updateNote = async (note: Note): Promise<Note> => {
  try {
    const response = await axios.put(`${API_URL}/${note.id}`, note);
    return response.data;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
};

// Delete a note
export const deleteNote = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
};