const mongoose = require('mongoose');

// Recursive topic schema
const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'done'],
    default: 'not-started',
  },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  timestamp: { type: Date, default: null },
  notes: { type: String, default: '' },
  locked: { type: Boolean, default: false },
  subtopics: { type: [], default: [] }, // populated dynamically as TopicSchema
});

// Self-referential subtopics
TopicSchema.add({ subtopics: [TopicSchema] });

const MemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

const SubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isGroup: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    inviteCode: { type: String, default: '' },
    members: [MemberSchema],
    syllabus: [TopicSchema],
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// Text index for search
SubjectSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Subject', SubjectSchema);
