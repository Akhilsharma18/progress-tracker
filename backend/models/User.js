const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: '' },
    branch: { type: String, default: '' },
    year: { type: String, default: '' },
    personalSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    subjectsJoined: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
