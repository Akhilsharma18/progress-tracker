const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/me', getProfile);
router.put('/me', updateProfile);

module.exports = router;
