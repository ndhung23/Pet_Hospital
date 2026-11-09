/**
 * File: index.js
 * Module: Centralized API Route Registry
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Aggregates and registers core sub-routes including appointments, pets, catalog, and schedule.
 */

const express = require('express');
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const aiRoutes = require('./ai.routes');
const appointmentRoutes = require('./appointment.routes');
const petRoutes = require('./pet.routes');
const catalogRoutes = require('./catalog.routes');
const scheduleRoutes = require('./schedule.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'PHMS API',
  });
});

// Existing routes
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/ai', aiRoutes);

// CRUD routes for HE194418 - Nhac Tuan Anh
router.use('/appointments', appointmentRoutes);
router.use('/pets', petRoutes);
router.use('/catalog', catalogRoutes);
router.use('/schedule', scheduleRoutes);

module.exports = router;
