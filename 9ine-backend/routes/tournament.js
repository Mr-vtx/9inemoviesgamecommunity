const express = require('express');
const router  = express.Router();
const Player  = require('../models/Player');

router.get('/players', async (req, res) => {
  try {
    const players = await Player.find()
      .select('name country level registeredAt')  // never expose whatsapp publicly
      .sort({ registeredAt: 1 });

    const maxPlayers = parseInt(process.env.MAX_PLAYERS) || 16;

    res.json({
      success: true,
      count: players.length,
      remaining: Math.max(0, maxPlayers - players.length),
      full: players.length >= maxPlayers,
      players
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, gameId, whatsapp, country, level, code } = req.body;

    const validCodes = (process.env.COMMUNITY_CODES || '')
      .split(',')
      .map(c => c.trim().toUpperCase());

    if (!code || !validCodes.includes(code.trim().toUpperCase())) {
      return res.status(401).json({
        success: false,
        field: 'code',
        message: 'Invalid community code. Check the 9ine WhatsApp group.'
      });
    }

    const maxPlayers = parseInt(process.env.MAX_PLAYERS) || 16;
    const count = await Player.countDocuments();

    if (count >= maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full. No more spots available.'
      });
    }

    const existing = await Player.findOne({ gameId: gameId?.trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        field: 'gameId',
        message: 'This Blood Strike ID is already registered.'
      });
    }

    const player = await Player.create({ name, gameId, whatsapp, country, level });

    res.status(201).json({
      success: true,
      message: "You're registered! Check WhatsApp for room details.",
      player: {
        name: player.name,
        country: player.country,
        level: player.level,
        registeredAt: player.registeredAt
      }
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        field: 'gameId',
        message: 'This Blood Strike ID is already registered.'
      });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error. Try again.' });
  }
});

router.get('/config', (req, res) => {
  res.json({
    success: true,
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 16,
    tournamentDate: process.env.TOURNAMENT_DATE || '2025-08-02T19:00:00Z'
  });
});

module.exports = router;
