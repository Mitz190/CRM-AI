// Usage:
//   npm run seed -- admin@acme.test            (re-creates sample data)
//   npm run seed -- admin@acme.test --clear    (removes sample data only)
const mongoose = require('mongoose');
const { mongoUri } = require('../config/env'); // loads .env and validates it
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Deal = require('../models/Deal');
const Activity = require('../models/Activity');

const DAY = 24 * 60 * 60 * 1000;
const daysFromNow = (n) => new Date(Date.now() + n * DAY);
const monthsAgo = (n) => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - n, 1); // 1st of that month, so never in the future
  return d;
};

const customers = [
  ['Aarav Mehta', 'Northwind Traders', 'enterprise'],
  ['Diya Sharma', 'Bright Schools', 'education'],
  ['Kunal Bose', 'Metro Motors', 'enterprise'],
  ['Priya Nair', 'Saffron Kitchens', 'smb'],
  ['Rahul Khanna', 'Urban Estates', 'smb'],
  ['Sneha Pillai', 'CareFirst Clinics', 'healthcare'],
  ['Yash Malhotra', 'Terra Farms', 'smb'],
  ['Zoya Ali', 'Orchid Hotels', 'enterprise'],
];

// [name, company, source, status, priority, budget]
const leads = [
  ['Kabir Shah', 'Zenith Labs', 'website', 'new', 'high', 12000],
  ['Meera Iyer', 'Orbit Retail', 'referral', 'contacted', 'medium', 8000],
  ['Rohan Das', 'BlueWave', 'linkedin', 'qualified', 'high', 25000],
  ['Ananya Rao', 'Peak Logistics', 'event', 'proposal', 'high', 40000],
  ['Vikram Singh', 'GreenLeaf', 'cold_call', 'negotiation', 'medium', 15000],
  ['Isha Kapoor', 'Nimbus Cloud', 'website', 'converted', 'medium', 18000],
  ['Arjun Nair', 'Helio Energy', 'referral', 'converted', 'high', 22000],
  ['Sara Khan', 'Pixel Studio', 'email_campaign', 'lost', 'low', 3000],
  ['Dev Patel', 'Crest Finance', 'linkedin', 'new', 'low', 5000],
  ['Neha Joshi', 'Alpine Foods', 'event', 'contacted', 'high', 30000],
  ['Rahul Verma', 'Summit Health', 'website', 'qualified', 'medium', 9000],
  ['Tara Menon', 'Lumen Media', 'referral', 'lost', 'medium', 6000],
];

// [title, value, stage, monthsAgo for closed deals]
const deals = [
  ['Annual platform license', 18000, 'won', 0],
  ['Onboarding package', 6500, 'won', 0],
  ['Support renewal', 9200, 'won', 1],
  ['Data migration', 5600, 'won', 1],
  ['Analytics add-on', 12400, 'won', 2],
  ['Regional expansion', 21000, 'won', 3],
  ['Pilot program', 7800, 'won', 4],
  ['Starter plan', 4300, 'won', 5],
  ['Legacy system swap', 8000, 'lost', 1],
  ['Retail analytics rollout', 14000, 'prospecting'],
  ['Partner portal', 9500, 'prospecting'],
  ['Fleet tracking suite', 26000, 'prospecting'],
  ['Warehouse insights', 17500, 'qualification'],
  ['CRM migration', 11000, 'qualification'],
  ['Enterprise license', 38000, 'proposal'],
  ['Training bundle', 7200, 'proposal'],
  ['Multi-year contract', 52000, 'negotiation'],
  ['Platform upgrade', 19500, 'negotiation'],
];

// [type, title, due in days, status, priority]
const activities = [
  ['call', 'Intro call with Kabir Shah', -2, 'pending', 'high'],
  ['follow_up', 'Send proposal to Peak Logistics', -1, 'pending', 'high'],
  ['meeting', 'Demo for BlueWave', 1, 'pending', 'high'],
  ['follow_up', 'Check in with Orbit Retail', 2, 'pending', 'medium'],
  ['call', 'Negotiation call: GreenLeaf', 4, 'pending', 'medium'],
  ['task', 'Prepare quarterly review deck', 7, 'pending', 'low'],
  ['meeting', 'Kickoff with Nimbus Cloud', -3, 'completed', 'medium'],
  ['call', 'Discovery call with Alpine Foods', -6, 'completed', 'medium'],
];

const main = async () => {
  const [email, flag] = process.argv.slice(2);
  if (!email) throw new Error('Usage: npm run seed -- <admin-email> [--clear]');

  await mongoose.connect(mongoUri);
  const admin = await User.findOne({ email: email.toLowerCase(), role: 'admin' });
  if (!admin) throw new Error(`No admin user found with email ${email}`);
  const org = admin.organization;

  // Remove previous sample data for this organization only.
  await Promise.all([Customer, Lead, Deal, Activity].map((M) => M.deleteMany({ organization: org, isSample: true })));
  if (flag === '--clear') return console.log('Sample data removed.');

  const team = await User.find({ organization: org, isActive: true }).sort({ createdAt: 1 });
  const pick = (i) => team[i % team.length]._id; // spread records across the team
  const base = { organization: org, createdBy: admin._id, isSample: true };

  const customerDocs = await Customer.insertMany(
    customers.map(([name, company, category], i) => ({
      ...base, name, company, category,
      email: `${name.split(' ')[0].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.example`,
      assignedTo: pick(i),
    }))
  );

  await Lead.insertMany(
    leads.map(([name, company, source, status, priority, budget], i) => {
      const closed = Lead.CLOSED_STATUSES.includes(status);
      return {
        ...base, name, company, source, status, priority, budget, assignedTo: pick(i),
        purchaseInterest: 'CRM platform',
        expectedConversionDate: closed ? undefined : daysFromNow(10 + i * 3),
        lostReason: status === 'lost' ? 'Went with a competitor' : undefined,
      };
    })
  );

  await Deal.insertMany(
    deals.map(([title, value, stage, ago], i) => {
      const open = Deal.OPEN_STAGES.includes(stage);
      return {
        ...base, title, value, stage, owner: pick(i), customer: customerDocs[i % customerDocs.length]._id,
        expectedCloseDate: open ? daysFromNow(15 + i * 5) : undefined,
        closedAt: open ? undefined : monthsAgo(ago),
        lostReason: stage === 'lost' ? 'Budget cut' : undefined,
      };
    })
  );

  await Activity.insertMany(
    activities.map(([type, title, due, status, priority], i) => ({
      ...base, type, title, status, priority, assignedTo: pick(i), dueDate: daysFromNow(due),
      completedAt: status === 'completed' ? daysFromNow(due) : undefined,
    }))
  );

  console.log(`Sample data created for ${team.length} team member(s): ${customers.length} customers, ${leads.length} leads, ${deals.length} deals, ${activities.length} activities.`);
};

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());