const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: [true, 'Customer name is required'], trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 120 },
    category: { type: String, trim: true, maxlength: 50, default: 'standard' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSample: { type: Boolean, default: false, select: false }, // seed data marker
  },
  { timestamps: true }
);

customerSchema.index({ organization: 1, assignedTo: 1 });

module.exports = mongoose.model('Customer', customerSchema);