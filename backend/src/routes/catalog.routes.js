const express = require('express');
const catalogController = require('../controllers/CatalogController');

const router = express.Router();

// GET /api/catalog/services
router.get('/services', (req, res, next) => catalogController.getServices(req, res, next));

module.exports = router;

