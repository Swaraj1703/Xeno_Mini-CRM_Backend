// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const passport = require('../services/auth.service');
require('dotenv').config();

// Username and Password Login Route

// Username and Password Login Route

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate credentials against environment variables
    if (
      username === process.env.APP_USERNAME &&
      password === process.env.APP_PASSWORD
    ) {
      // Mark session as authenticated
      req.session.isAuthenticated = true;

      const userId = process.env.APP_USER_ID || 'static-user-id'; 
      req.session.userId = userId;

      // Respond with success and include the userId
      res.json({ success: true, message: 'Login successful', userId });
    } else {
      // Respond with invalid credentials
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'An error occurred during login' });
  }
});


// Google Authentication Routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.isAuthenticated = true;
    req.session.googleId = req.user.googleId; // Store googleId in session

    console.log('Session after Google login:', req.session); // Debug session

    // Redirect to the frontend with googleId as a query parameter
    // const redirectUrl = `http://localhost:3000/home?googleId=${req.user.googleId}`;
    const redirectUrl = `https://xeno-frontend-chi.vercel.app/home?googleId=${req.user.googleId}`;
    res.redirect(redirectUrl);
  }
);

// Route to check authentication status
router.get('/status', (req, res) => {
  console.log('Session in /status:', req.session); // Debug session object
  res.json({ isAuthenticated: req.session.isAuthenticated || false });
});

// Logout Route
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to destroy session' });
      }

      res.clearCookie('connect.sid', { path: '/' });
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});

module.exports = router;
