const mongoose = require('mongoose');

const TYPES = ['call', 'meeting', 'follow_up', 'task', 'reminder'];

const activitySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: { type: String, enum: TYPES, default: 'task' },
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 1000 },
    dueDate: { type: Date, required: [true, 'Due date is required'] },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    completedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSample: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

activitySchema.index({ organization: 1, status: 1, dueDate: 1 });
activitySchema.index({ organization: 1, assignedTo: 1 });

const Activity = mongoose.model('Activity', activitySchema);
Activity.TYPES = TYPES;
module.exports = Activity;