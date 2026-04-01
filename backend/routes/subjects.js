const express = require('express');
const router = express.Router();
const {
  getMySubjects,
  getPublicSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  addTopic,
  lockTopic,
} = require('../controllers/subjectController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/', getMySubjects);
router.get('/public', getPublicSubjects);
router.get('/:id', getSubject);
router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);
router.post('/:id/topics', addTopic);
router.patch('/:id/topics/:tid/lock', lockTopic);

module.exports = router;
