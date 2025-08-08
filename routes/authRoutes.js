const express = require('express');
const router = express.Router();
const { pool } = require('../db/db');

// Auth login: verify email + password, return role and basic user info
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required.' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  pool.query(
    'SELECT id, firstname, lastname, email, role, password FROM users WHERE LOWER(email) = ? LIMIT 1',
    [normalizedEmail],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const user = results[0];

      // Plaintext compare (no hashing specified)
      if (String(user.password) !== String(password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const role = user.role;
      const allowedRoles = ['superAdmin', 'admin', 'user'];
      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'Unauthorized role' });
      }

      // Simple opaque token (MVP only)
      const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

      return res.json({
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: role,
        token,
      });
    }
  );
});

module.exports = router;
