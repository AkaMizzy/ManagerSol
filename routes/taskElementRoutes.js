const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

const ALLOWED_TYPES = ['text', 'number', 'file', 'date', 'boolean', 'gps', 'list'];

// Create a new task element
router.post('/task-elements', (req, res) => {
  const {
    title,
    intitule, // accept alternate naming, map to title if provided
    description,
    type,
    mask,
  } = req.body;

  const resolvedTitle = title || intitule;
  if (!resolvedTitle || !type) {
    return res.status(400).json({ error: 'title and type are required.' });
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return res.status(400).json({ error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
  }

  const sql = `INSERT INTO task_element (title, description, type, mask) VALUES (?, ?, ?, ?)`;
  pool.query(sql, [resolvedTitle, description || null, type, mask || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(201).json({ message: 'Task element created', id: result.insertId });
  });
});

// Get all task elements (optional filter by type via query param)
router.get('/task-elements', (req, res) => {
  const { type } = req.query;
  if (type) {
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }
    pool.query('SELECT * FROM task_element WHERE type = ?', [type], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(results);
    });
  } else {
    pool.query('SELECT * FROM task_element', (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.json(results);
    });
  }
});

// Get a single task element by ID
router.get('/task-elements/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM task_element WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Task element not found' });
    }
    return res.json(results[0]);
  });
});

// Update a task element (partial update)
router.put('/task-elements/:id', (req, res) => {
  const { id } = req.params;
  const { title, intitule, description, type, mask } = req.body;

  const resolvedTitle = title || intitule;
  const fields = [];
  const params = [];

  if (resolvedTitle !== undefined) { fields.push('title = ?'); params.push(resolvedTitle); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description || null); }
  if (type !== undefined) {
    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(', ')}` });
    }
    fields.push('type = ?'); params.push(type);
  }
  if (mask !== undefined) { fields.push('mask = ?'); params.push(mask || null); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  params.push(id);
  const sql = `UPDATE task_element SET ${fields.join(', ')} WHERE id = ?`;
  pool.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: 'Task element updated', affectedRows: result.affectedRows });
  });
});

// Delete a task element
router.delete('/task-elements/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM task_element WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task element not found' });
    }
    return res.json({ message: 'Task element deleted' });
  });
});

module.exports = router;
