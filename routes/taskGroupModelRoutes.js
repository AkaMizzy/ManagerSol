const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// Create a new task group model
router.post('/task-group-models', (req, res) => {
  const { title, intitule, domain, description } = req.body;
  const resolvedTitle = title || intitule;

  if (!resolvedTitle) {
    return res.status(400).json({ error: 'title is required.' });
  }

  const sql = 'INSERT INTO task_group_model (title, domain, description) VALUES (?, ?, ?)';
  pool.query(sql, [resolvedTitle, domain || null, description || null], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(201).json({ message: 'Task group model created' });
  });
});

// Get all task group models
router.get('/task-group-models', (req, res) => {
  pool.query('SELECT * FROM task_group_model', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json(results);
  });
});

// Get a single task group model by ID
router.get('/task-group-models/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM task_group_model WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Task group model not found' });
    }
    return res.json(results[0]);
  });
});

// Update a task group model (partial update)
router.put('/task-group-models/:id', (req, res) => {
  const { id } = req.params;
  const { title, intitule, domain, description } = req.body;
  const resolvedTitle = title || intitule;

  const fields = [];
  const params = [];

  if (resolvedTitle !== undefined) { fields.push('title = ?'); params.push(resolvedTitle); }
  if (domain !== undefined) { fields.push('domain = ?'); params.push(domain || null); }
  if (description !== undefined) { fields.push('description = ?'); params.push(description || null); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }

  params.push(id);
  const sql = `UPDATE task_group_model SET ${fields.join(', ')} WHERE id = ?`;
  pool.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.json({ message: 'Task group model updated', affectedRows: result.affectedRows });
  });
});

// Delete a task group model
router.delete('/task-group-models/:id', (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM task_group_model WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task group model not found' });
    }
    return res.json({ message: 'Task group model deleted' });
  });
});

module.exports = router;
