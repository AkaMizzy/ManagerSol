const express = require('express');
const router = express.Router();
const db = require('../db/db');
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
  db.query(
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
  db.query('SELECT * FROM company', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a company by ID
router.get('/companies/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM company WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(results[0]);
  });
});

module.exports = router;