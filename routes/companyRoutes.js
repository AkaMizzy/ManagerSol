const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');
const multer = require('multer');
const path = require('path');

// Multer setup for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create a new company with logo upload
router.post('/companies', upload.single('logo'), (req, res) => {
  const { title, description, email, nb_users, status, foundedYear, sector } = req.body;
  let logo = null;
  if (req.file) {
    logo = '/uploads/' + req.file.filename;
  }
  if (!title || !email) {
    return res.status(400).json({ error: 'Title and email are required.' });
  }
  const sql = `INSERT INTO company (title, description, logo, email, nb_users, status, foundedYear, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  pool.query(
    sql,
    [title, description || null, logo, email, nb_users || 2, status || 'pending', foundedYear || null, sector || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'Company created', companyId: result.insertId, logo });
    }
  );
});

// Get all companies
router.get('/companies', (req, res) => {
  pool.query('SELECT * FROM company', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a company by ID
router.get('/companies/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM company WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(results[0]);
  });
});

// Update a company (with optional logo upload)
router.put('/companies/:id', upload.single('logo'), (req, res) => {
  const { id } = req.params;
  const { title, description, email, nb_users, status, foundedYear, sector } = req.body;
  let logo = null;
  if (req.file) {
    logo = '/uploads/' + req.file.filename;
  }
  // Build SQL and params dynamically to only update provided fields
  const fields = [];
  const params = [];
  if (title) { fields.push('title = ?'); params.push(title); }
  if (description) { fields.push('description = ?'); params.push(description); }
  if (email) { fields.push('email = ?'); params.push(email); }
  if (nb_users) { fields.push('nb_users = ?'); params.push(nb_users); }
  if (status) { fields.push('status = ?'); params.push(status); }
  if (foundedYear) { fields.push('foundedYear = ?'); params.push(foundedYear); }
  if (sector) { fields.push('sector = ?'); params.push(sector); }
  if (logo) { fields.push('logo = ?'); params.push(logo); }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }
  params.push(id);
  const sql = `UPDATE company SET ${fields.join(', ')} WHERE id = ?`;
  pool.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Company updated', affectedRows: result.affectedRows });
  });
});

module.exports = router;