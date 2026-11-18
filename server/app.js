const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// High-Performance Compression (Gzip / Deflate)
app.use(compression({
  filter: (req, res) => {
    // Never compress Server-Sent Events (SSE) streaming connections
    if (req.headers.accept === 'text/event-stream' || req.url.includes('/api/sync/')) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets with aggressive 7-day caching for CSS/JS/images and immediate revalidation for HTML
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

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
