const express = require('express');
const app = express();
const path = require('path');
const companyRoutes = require('./routes/companyRoutes');
const userRoutes = require('./routes/userRoutes');
const taskElementRoutes = require('./routes/taskElementRoutes');
const taskGroupModelRoutes = require('./routes/taskGroupModelRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

// Manually set CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(companyRoutes);
app.use(userRoutes);
app.use(taskElementRoutes);
app.use(taskGroupModelRoutes);
app.use(authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});