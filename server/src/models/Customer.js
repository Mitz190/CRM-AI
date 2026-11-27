const mongoose = require('mongoose');

const STATUSES = ['active', 'inactive'];
const SORT_FIELDS = ['name', 'company', 'category', 'status', 'createdAt'];

const customerSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    name: { type: String, required: [true, 'Customer name is required'], trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, trim: true, maxlength: 30 },
    company: { type: String, trim: true, maxlength: 120 },
    jobTitle: { type: String, trim: true, maxlength: 80 },
    category: { type: String, trim: true, maxlength: 50, default: 'standard' },
    status: { type: String, enum: STATUSES, default: 'active' },
    website: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 80 },
    country: { type: String, trim: true, maxlength: 80 },
    notes: { type: String, trim: true, maxlength: 2000 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSample: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

customerSchema.index({ organization: 1, assignedTo: 1 });
customerSchema.index({ organization: 1, createdAt: -1 });
// Unique email per organization, only enforced when an email exists.
customerSchema.index(
  { organization: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

const Customer = mongoose.model('Customer', customerSchema);
Customer.STATUSES = STATUSES;
Customer.SORT_FIELDS = SORT_FIELDS;
module.exports = Customer;