const { v4: uuidv4 } = require('uuid');
const Subject = require('../models/Subject');
const User = require('../models/User');

// GET /api/subjects — My subjects
exports.getMySubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('createdBy', 'name avatar email')
      .sort({ updatedAt: -1 });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

// GET /api/subjects/public — Public subjects
exports.getPublicSubjects = async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    let query = { isPublic: true };
    if (search) query.$text = { $search: search };
    const subjects = await Subject.find(query)
      .populate('createdBy', 'name avatar email')
      .sort(sort === 'name' ? { name: 1 } : { updatedAt: -1 });
    res.json(subjects);
  } catch (err) {
    next(err);
  }
};

// GET /api/subjects/:id
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('createdBy', 'name avatar email')
      .populate('members.user', 'name avatar email');
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Check access
    const isMember =
      subject.createdBy._id.toString() === req.user._id.toString() ||
      subject.members.some((m) => m.user._id.toString() === req.user._id.toString());
    if (!subject.isPublic && !isMember)
      return res.status(403).json({ error: 'Access denied' });

    res.json(subject);
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects
exports.createSubject = async (req, res, next) => {
  try {
    const { name, description, isGroup, isPublic, syllabus, tags } = req.body;
    const inviteCode = isGroup ? uuidv4().slice(0, 8).toUpperCase() : '';

    const subject = await Subject.create({
      name,
      description,
      createdBy: req.user._id,
      isGroup: !!isGroup,
      isPublic: !!isPublic,
      inviteCode,
      members: [{ user: req.user._id, role: 'admin' }],
      syllabus: syllabus || [],
      tags: tags || [],
    });

    // Add to user's personalSubjects
    await User.findByIdAndUpdate(req.user._id, {
      $push: { personalSubjects: subject._id },
    });

    const populated = await subject.populate('createdBy', 'name avatar email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

// PUT /api/subjects/:id
exports.updateSubject = async (req, res, next) => {
  try {
    const { name, description, isPublic, syllabus, tags } = req.body;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description, isPublic, syllabus, tags },
      { new: true }
    ).populate('createdBy', 'name avatar email');

    if (!subject) return res.status(404).json({ error: 'Subject not found or not authorized' });
    res.json(subject);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/subjects/:id
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!subject) return res.status(404).json({ error: 'Subject not found or not authorized' });

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { personalSubjects: subject._id, subjectsJoined: subject._id },
    });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/subjects/:id/topics — Add a top-level topic
exports.addTopic = async (req, res, next) => {
  try {
    const { title, notes } = req.body;
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    subject.syllabus.push({ title, notes, subtopics: [] });
    await subject.save();
    res.json(subject);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/subjects/:id/topics/:tid/lock
exports.lockTopic = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const findAndLock = (topics) => {
      for (let t of topics) {
        if (t._id.toString() === req.params.tid) {
          t.locked = !t.locked;
          return true;
        }
        if (t.subtopics?.length && findAndLock(t.subtopics)) return true;
      }
      return false;
    };

    findAndLock(subject.syllabus);
    await subject.save();
    res.json(subject);
  } catch (err) {
    next(err);
  }
};
