import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Define the path to the JSON file
const dataFilePath = path.join(__dirname, 'notes.json');

// Ensure the data file exists
const ensureDataFileExists = () => {
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]), 'utf8');
  }
};

// Read all notes from the JSON file
const readNotes = () => {
  ensureDataFileExists();
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading notes:', error);
    return [];
  }
};

// Write notes to the JSON file
const writeNotes = (notes) => {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(notes, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing notes:', error);
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Get all notes
app.get('/api/notes', (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

// Get a specific note by ID
app.get('/api/notes/:id', (req, res) => {
  const notes = readNotes();
  const note = notes.find(n => n.id === req.params.id);
  
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  res.json(note);
});

// Create a new note
app.post('/api/notes', (req, res) => {
  const notes = readNotes();
  const newNote = {
    id: uuidv4(),
    ...req.body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  notes.unshift(newNote);
  writeNotes(notes);
  
  res.status(201).json(newNote);
});

// Update an existing note
app.put('/api/notes/:id', (req, res) => {
  const notes = readNotes();
  const index = notes.findIndex(n => n.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  const updatedNote = {
    ...notes[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  notes[index] = updatedNote;
  writeNotes(notes);
  
  res.json(updatedNote);
});

// Delete a note
app.delete('/api/notes/:id', (req, res) => {
  const notes = readNotes();
  const filteredNotes = notes.filter(n => n.id !== req.params.id);
  
  if (filteredNotes.length === notes.length) {
    return res.status(404).json({ error: 'Note not found' });
  }
  
  writeNotes(filteredNotes);
  
  res.status(204).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});