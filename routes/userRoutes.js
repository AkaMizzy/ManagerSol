const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// Get all users
router.get('/users', (req, res) => {
  pool.query('SELECT * FROM users', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a user by ID
router.get('/users/:id', (req, res) => {
  const { id } = req.params;
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// Create a new user
router.post('/users', (req, res) => {
  const {
    firstname,
    lastname,
    email,
    email_second,
    identifier,
    phone1,
    phone2,
    password,
    status,
    role,
    company_id
  } = req.body;
  if (!firstname || !lastname || !email || !password || !company_id) {
    return res.status(400).json({ error: 'firstname, lastname, email, password, and company_id are required.' });
  }
  const sql = `INSERT INTO users (firstname, lastname, email, email_second, identifier, phone1, phone2, password, status, role, company_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  pool.query(
    sql,
    [firstname, lastname, email, email_second || null, identifier || null, phone1 || null, phone2 || null, password, status || null, role || null, company_id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: 'User created', userId: result.insertId });
    }
  );
});

// Update a user
router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const {
    firstname,
    lastname,
    email,
    email_second,
    identifier,
    phone1,
    phone2,
    password,
    status,
    role,
    company_id
  } = req.body;
  // Build SQL and params dynamically to only update provided fields
  const fields = [];
  const params = [];
  if (firstname) { fields.push('firstname = ?'); params.push(firstname); }
  if (lastname) { fields.push('lastname = ?'); params.push(lastname); }
  if (email) { fields.push('email = ?'); params.push(email); }
  if (email_second) { fields.push('email_second = ?'); params.push(email_second); }
  if (identifier) { fields.push('identifier = ?'); params.push(identifier); }
  if (phone1) { fields.push('phone1 = ?'); params.push(phone1); }
  if (phone2) { fields.push('phone2 = ?'); params.push(phone2); }
  if (password) { fields.push('password = ?'); params.push(password); }
  if (status) { fields.push('status = ?'); params.push(status); }
  if (role) { fields.push('role = ?'); params.push(role); }
  if (company_id) { fields.push('company_id = ?'); params.push(company_id); }
  if (fields.length === 0) {
    return res.status(400).json({ error: 'No fields provided for update.' });
  }
  params.push(id);
  const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
  pool.query(sql, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'User updated', affectedRows: result.affectedRows });
  });
});

module.exports = router;