/**
 * File: catalog.routes.js
 * Module: Catalog Route Definitions
 * Author: he194418-NhacTuanAnh
 * Date: 09/11/2026
 * Version: 1.0.0
 * Description: Express routes for querying care services by species and size.
 */

const express = require('express');
const catalogController = require('../controllers/CatalogController');

const router = express.Router();

// GET /api/catalog/services
router.get('/services', (req, res, next) => catalogController.getServices(req, res, next));

module.exports = router;

