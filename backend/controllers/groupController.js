const Subject = require('../models/Subject');
const User = require('../models/User');

// POST /api/groups/join — Join by invite code
exports.joinGroup = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const subject = await Subject.findOne({ inviteCode });
    if (!subject) return res.status(404).json({ error: 'Invalid invite code' });

    const alreadyMember = subject.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (alreadyMember) return res.status(400).json({ error: 'Already a member' });

    subject.members.push({ user: req.user._id, role: 'member' });
    await subject.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { subjectsJoined: subject._id },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(subject._id.toString()).emit('member-joined', {
        user: { _id: req.user._id, name: req.user.name, avatar: req.user.avatar },
      });
    }

    res.json({ message: 'Joined successfully', subjectId: subject._id });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id/members
exports.getMembers = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id).populate(
      'members.user',
      'name avatar email'
    );
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json(subject.members);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id/members/:uid — Admin removes a member
exports.removeMember = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const isAdmin =
      subject.createdBy.toString() === req.user._id.toString() ||
      subject.members.find(
        (m) => m.user.toString() === req.user._id.toString() && m.role === 'admin'
      );
    if (!isAdmin) return res.status(403).json({ error: 'Admin only' });

    subject.members = subject.members.filter(
      (m) => m.user.toString() !== req.params.uid
    );
    await subject.save();

    await User.findByIdAndUpdate(req.params.uid, {
      $pull: { subjectsJoined: subject._id },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(subject._id.toString()).emit('member-removed', { userId: req.params.uid });
    }

    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/groups/:id/members/:uid/role — Promote/demote
exports.updateMemberRole = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    if (subject.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ error: 'Only creator can change roles' });

    const member = subject.members.find(
      (m) => m.user.toString() === req.params.uid
    );
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.role = req.body.role;
    await subject.save();
    res.json({ message: 'Role updated' });
  } catch (err) {
    next(err);
  }
};
