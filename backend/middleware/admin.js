const Subject = require('../models/Subject');

exports.isAdmin = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const memberEntry = subject.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isCreator = subject.createdBy.toString() === req.user._id.toString();

    if (!memberEntry && !isCreator)
      return res.status(403).json({ error: 'Not a member of this subject' });

    if (memberEntry?.role !== 'admin' && !isCreator)
      return res.status(403).json({ error: 'Admin access required' });

    req.subject = subject;
    next();
  } catch (err) {
    next(err);
  }
};
