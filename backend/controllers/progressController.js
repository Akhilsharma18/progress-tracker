const Progress = require('../models/Progress');
const Subject = require('../models/Subject');

// GET /api/progress/:subjectId
exports.getProgress = async (req, res, next) => {
  try {
    const records = await Progress.find({ subjectId: req.params.subjectId }).populate(
      'userId',
      'name avatar email'
    );
    res.json(records);
  } catch (err) {
    next(err);
  }
};

// POST /api/progress — Toggle / update progress for a topic
exports.updateProgress = async (req, res, next) => {
  try {
    const { subjectId, topicId, status } = req.body;

    // Verify subject exists and user is a member
    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const isMember =
      subject.createdBy.toString() === req.user._id.toString() ||
      subject.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return res.status(403).json({ error: 'Not a member' });

    // Check topic lock
    const findTopic = (topics, id) => {
      for (const t of topics) {
        if (t._id.toString() === id) return t;
        const found = findTopic(t.subtopics || [], id);
        if (found) return found;
      }
      return null;
    };
    const topic = findTopic(subject.syllabus, topicId);
    if (topic?.locked) return res.status(403).json({ error: 'Topic is locked by admin' });

    const record = await Progress.findOneAndUpdate(
      { userId: req.user._id, subjectId, topicId },
      { status },
      { upsert: true, new: true }
    ).populate('userId', 'name avatar email');

    // Update topic status in subject syllabus
    const updateTopicStatus = (topics) => {
      for (let t of topics) {
        if (t._id.toString() === topicId) {
          t.status = status;
          t.markedBy = req.user._id;
          t.timestamp = new Date();
          return true;
        }
        if (t.subtopics?.length && updateTopicStatus(t.subtopics)) return true;
      }
      return false;
    };
    updateTopicStatus(subject.syllabus);
    subject.markModified('syllabus');
    await subject.save();

    // Emit socket event
    const io = req.app.get('io');
    if (io) {
      io.to(subjectId).emit('progress-update', {
        topicId,
        status,
        user: {
          _id: req.user._id,
          name: req.user.name,
          avatar: req.user.avatar,
        },
        record,
      });
    }

    res.json(record);
  } catch (err) {
    next(err);
  }
};
