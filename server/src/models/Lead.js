const mongoose = require('mongoose');

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'converted', 'lost'];
const CLOSED_STATUSES = ['converted', 'lost'];
const PRIORITIES = ['low', 'medium', 'high'];

const leadSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: [true, 'Lead name is required'], trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 120 },
    source: { type: String, trim: true, maxlength: 50 },
    status: { type: String, enum: STATUSES, default: 'new' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    budget: { type: Number, min: 0 },
    purchaseInterest: { type: String, trim: true, maxlength: 200 },
    expectedConversionDate: Date,
    lostReason: { type: String, trim: true, maxlength: 300 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSample: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

leadSchema.index({ organization: 1, status: 1 });
leadSchema.index({ organization: 1, assignedTo: 1 });

const Lead = mongoose.model('Lead', leadSchema);
Lead.STATUSES = STATUSES;
Lead.CLOSED_STATUSES = CLOSED_STATUSES;
Lead.PRIORITIES = PRIORITIES;
module.exports = Lead;