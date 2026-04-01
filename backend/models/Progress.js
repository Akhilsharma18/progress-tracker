const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topicId: { type: String, required: true }, // Mongo subdoc _id as string
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'done'],
      default: 'not-started',
    },
  },
  { timestamps: true }
);

// Compound index for efficient lookups
ProgressSchema.index({ userId: 1, subjectId: 1, topicId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', ProgressSchema);
