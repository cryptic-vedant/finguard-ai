const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { getForecast } = require('../controllers/forecastController');

router.use(protect);
router.get('/', getForecast);

module.exports = router;