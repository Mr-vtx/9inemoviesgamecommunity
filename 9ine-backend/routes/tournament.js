const express = require('express');
const router  = express.Router();
const Player  = require('../models/Player');

// ── GET /api/players ─────────────────────────────────────────
router.get('/players', async (req, res) => {
  try {
    const players = await Player.find()
      .select('name country level registeredAt')
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

// ── POST /api/register ────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, gameId, whatsapp, country, level, code } = req.body;

    const validCodes = (process.env.COMMUNITY_CODES || '')
      .split(',')
      .map(c => c.trim().toUpperCase());

    const submittedCode = (code || '').trim().toUpperCase();

    if (!submittedCode || !validCodes.includes(submittedCode)) {
      return res.status(401).json({
        success: false,
        field: 'code',
        message: 'Invalid community code. Check the 9ine WhatsApp group.'
      });
    }

    // Shared code mode — no "already used" check.
    // When you get a bot for individual codes, re-enable usedCode logic.

    const maxPlayers = parseInt(process.env.MAX_PLAYERS) || 16;
    const count = await Player.countDocuments();

    if (count >= maxPlayers) {
      return res.status(400).json({
        success: false,
        message: 'Tournament is full. No more spots available.'
      });
    }

    // ── Block registration 30 mins before tournament ──────────
    const tournamentDate = new Date(process.env.TOURNAMENT_DATE || '2025-08-02T21:00:00Z');
    const cutoff = new Date(tournamentDate.getTime() - 30 * 60 * 1000);
    if (new Date() >= cutoff) {
      return res.status(403).json({
        success: false,
        field: 'closed',
        message: 'Registration is now closed. Tournament starts in less than 30 minutes!'
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

    const player = await Player.create({
      name,
      gameId,
      whatsapp,
      country,
      level,
      usedCode: submittedCode,
    });

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

// ── GET /api/config ───────────────────────────────────────────
// Returns tournament date + max players to frontend
router.get('/config', (req, res) => {
  const tournamentDate = process.env.TOURNAMENT_DATE || '2025-08-02T21:00:00Z';
  const cutoff = new Date(new Date(tournamentDate).getTime() - 30 * 60 * 1000);

  res.json({
    success: true,
    maxPlayers: parseInt(process.env.MAX_PLAYERS) || 16,
    tournamentDate,
    registrationCutoff: cutoff.toISOString() // 30 mins before
  });
});

module.exports = router;
