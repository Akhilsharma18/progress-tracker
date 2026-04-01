const express = require('express');
const router = express.Router();
const { getProgress, updateProgress } = require('../controllers/progressController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/:subjectId', getProgress);
router.post('/', updateProgress);

module.exports = router;
