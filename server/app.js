const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// API routes
app.use('/api', apiRoutes);

// Explicit routes for SPA and admin
app.get(['/dashboard', '/hub'], (req, res) => {
  res.sendFile(path.join(publicDir, 'dashboard.html'));
});

app.get('/viswanandini', (req, res) => {
  res.sendFile(path.join(publicDir, 'viswanandini.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

app.get('/invoice', (req, res) => {
  res.sendFile(path.join(publicDir, 'invoice.html'));
});

app.get('/track-order', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.get('/schemes', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Fallback catch-all middleware for client-side routing
app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

module.exports = app;
