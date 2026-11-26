const User = require('../../models/User');
const Customer = require('../../models/Customer');
const Lead = require('../../models/Lead');
const Deal = require('../../models/Deal');
const Activity = require('../../models/Activity');

const MONTHS = 6;

// Admin: whole organization. Sales rep: only records assigned to / owned by them.
const buildScopes = (user) => {
  const org = { organization: user.organization };
  if (user.role === 'admin') return { customer: org, lead: org, deal: org, activity: org };
  return {
    customer: { ...org, assignedTo: user._id },
    lead: { ...org, assignedTo: user._id },
    deal: { ...org, owner: user._id },
    activity: { ...org, assignedTo: user._id },
  };
};

const monthKey = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

// The last 6 months (oldest first), so months with no revenue still appear as 0.
const buildMonthSlots = (now) =>
  Array.from({ length: MONTHS }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (MONTHS - 1 - i), 1));
    return { key: monthKey(d), label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) };
  });

const round1 = (n) => Math.round(n * 10) / 10;

const getDashboard = async (user) => {
  const now = new Date();
  const isAdmin = user.role === 'admin';
  const scope = buildScopes(user);
  const slots = buildMonthSlots(now);
  const rangeStart = new Date(`${slots[0].key}-01T00:00:00.000Z`);

  const [
    totalCustomers,
    leadCounts,
    pipelineRows,
    revenueRows,
    pendingFollowUps,
    overdueFollowUps,
    highPriorityLeads,
    upcomingActivities,
    teamPerformance,
  ] = await Promise.all([
    Customer.countDocuments(scope.customer),

    Lead.aggregate([{ $match: scope.lead }, { $group: { _id: '$status', count: { $sum: 1 } } }]),

    Deal.aggregate([
      { $match: { ...scope.deal, stage: { $in: Deal.OPEN_STAGES } } },
      { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]),

    Deal.aggregate([
      { $match: { ...scope.deal, stage: 'won', closedAt: { $gte: rangeStart } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$closedAt' } }, revenue: { $sum: '$value' } } },
    ]),

    Activity.countDocuments({ ...scope.activity, status: 'pending' }),
    Activity.countDocuments({ ...scope.activity, status: 'pending', dueDate: { $lt: now } }),

    Lead.find({ ...scope.lead, priority: 'high', status: { $nin: Lead.CLOSED_STATUSES } })
      .sort({ budget: -1 })
      .limit(5)
      .select('name company status priority budget expectedConversionDate assignedTo')
      .populate('assignedTo', 'name')
      .lean(),

    Activity.find({ ...scope.activity, status: 'pending' })
      .sort({ dueDate: 1 })
      .limit(5)
      .select('title type priority dueDate assignedTo')
      .populate('assignedTo', 'name')
      .lean(),

    isAdmin
      ? Deal.aggregate([
          { $match: { ...scope.deal, stage: 'won', closedAt: { $gte: rangeStart } } },
          { $group: { _id: '$owner', wonValue: { $sum: '$value' }, wonDeals: { $sum: 1 } } },
          { $sort: { wonValue: -1 } },
          { $limit: 8 },
          { $lookup: { from: User.collection.name, localField: '_id', foreignField: '_id', as: 'user' } },
          {
            $project: {
              _id: 0,
              userId: '$_id',
              name: { $ifNull: [{ $arrayElemAt: ['$user.name', 0] }, 'Unknown'] },
              wonValue: 1,
              wonDeals: 1,
            },
          },
        ])
      : Promise.resolve([]),
  ]);

  // Leads
  const byStatus = Object.fromEntries(leadCounts.map((r) => [r._id, r.count]));
  const totalLeads = leadCounts.reduce((sum, r) => sum + r.count, 0);
  const converted = byStatus.converted || 0;
  const lost = byStatus.lost || 0;
  const activeLeads = totalLeads - converted - lost;
  const conversionRate = totalLeads ? round1((converted / totalLeads) * 100) : 0;

  // Revenue
  const revenueByKey = Object.fromEntries(revenueRows.map((r) => [r._id, r.revenue]));
  const revenueTrend = slots.map((s) => ({ month: s.key, label: s.label, revenue: revenueByKey[s.key] || 0 }));
  const monthlyRevenue = revenueTrend[MONTHS - 1].revenue;
  const previousRevenue = revenueTrend[MONTHS - 2].revenue;
  const revenueChangePct = previousRevenue ? round1(((monthlyRevenue - previousRevenue) / previousRevenue) * 100) : null;

  // Pipeline (every open stage is listed, even when empty)
  const pipeline = Deal.OPEN_STAGES.map((stage) => {
    const row = pipelineRows.find((r) => r._id === stage);
    return { stage, count: row?.count || 0, value: row?.value || 0 };
  });
  const openPipelineValue = pipeline.reduce((sum, p) => sum + p.value, 0);

  return {
    scope: isAdmin ? 'organization' : 'personal',
    kpis: {
      totalCustomers,
      activeLeads,
      conversionRate,
      monthlyRevenue,
      revenueChangePct,
      openPipelineValue,
      pendingFollowUps,
      overdueFollowUps,
    },
    pipeline,
    revenueTrend,
    highPriorityLeads,
    upcomingActivities,
    teamPerformance,
  };
};

module.exports = { getDashboard };