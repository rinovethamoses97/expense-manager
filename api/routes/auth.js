const express = require('express');
const passport = require('passport');
const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Initiate Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: `${CLIENT_URL}/login?error=auth_failed` }),
  (req, res) => {
    console.log("Checking Redirect Google");
    res.redirect(CLIENT_URL);
  }
);

// Get current logged-in user
router.get('/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});

module.exports = router;
