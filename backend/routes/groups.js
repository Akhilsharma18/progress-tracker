const express = require('express');
const router = express.Router();
const {
  joinGroup,
  getMembers,
  removeMember,
  updateMemberRole,
} = require('../controllers/groupController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.post('/join', joinGroup);
router.get('/:id/members', getMembers);
router.delete('/:id/members/:uid', removeMember);
router.patch('/:id/members/:uid/role', updateMemberRole);

module.exports = router;
