const mongoose = require('mongoose');

const STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation', 'won', 'lost'];
const OPEN_STAGES = ['prospecting', 'qualification', 'proposal', 'negotiation'];

const dealSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    title: { type: String, required: [true, 'Deal title is required'], trim: true, maxlength: 150 },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
    value: { type: Number, required: [true, 'Deal value is required'], min: 0, default: 0 },
    stage: { type: String, enum: STAGES, default: 'prospecting' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expectedCloseDate: Date,
    closedAt: Date,
    lostReason: { type: String, trim: true, maxlength: 300 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isSample: { type: Boolean, default: false, select: false },
  },
  { timestamps: true }
);

// Stamp closedAt when a deal is won or lost; clear it if the deal is reopened.
dealSchema.pre('save', async function () {
  if (!this.isModified('stage')) return;
  if (OPEN_STAGES.includes(this.stage)) this.closedAt = undefined;
  else if (!this.closedAt) this.closedAt = new Date();
});

dealSchema.index({ organization: 1, stage: 1 });
dealSchema.index({ organization: 1, owner: 1 });
dealSchema.index({ organization: 1, closedAt: 1 });

const Deal = mongoose.model('Deal', dealSchema);
Deal.STAGES = STAGES;
Deal.OPEN_STAGES = OPEN_STAGES;
module.exports = Deal;