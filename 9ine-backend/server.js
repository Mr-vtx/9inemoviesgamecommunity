require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const path       = require('path');
const tournament = require('./routes/tournament');

const app  = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', tournament);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(`✅ MongoDB connected: ${process.env.MONGODB_URI}`);
    app.listen(PORT, () => {
      console.log(`🚀 9ine Tournament Server running on http://localhost:${PORT}`);
      console.log(`📋 API endpoints:`);
      console.log(`   GET  /api/config`);
      console.log(`   GET  /api/players`);
      console.log(`   POST /api/register`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB disconnected. Server shut down.');
  process.exit(0);
});
