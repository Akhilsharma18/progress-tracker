const User = require('../models/User');
const Subject = require('../models/Subject');
const Progress = require('../models/Progress');

// GET /api/users/me
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('personalSubjects', 'name isGroup isPublic')
      .populate('subjectsJoined', 'name isGroup isPublic');

    const totalSubjects =
      (user.personalSubjects?.length || 0) + (user.subjectsJoined?.length || 0);

    const completedTopics = await Progress.countDocuments({
      userId: req.user._id,
      status: 'done',
    });

    const groupsJoined = await Subject.countDocuments({
      'members.user': req.user._id,
      isGroup: true,
    });

    const contributionCount = await Progress.countDocuments({ userId: req.user._id });

    res.json({
      ...user.toObject(),
      stats: {
        totalSubjects,
        completedTopics,
        groupsJoined,
        contributionCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/me — Update branch and year
exports.updateProfile = async (req, res, next) => {
  try {
    const { branch, year } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { branch, year },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
};
