const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const aiRoutes = require('./ai.routes');
const triageRoutes = require('./triage.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PHMS API',
  });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/ai', aiRoutes);
router.use('/triage', triageRoutes);

module.exports = router;
