const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');
const Customer = require('../../models/Customer');
const Deal = require('../../models/Deal');
const Activity = require('../../models/Activity');
const User = require('../../models/User');
const AppError = require('../../utils/AppError');

const TEXT_FIELDS = ['name', 'email', 'phone', 'company', 'jobTitle', 'category', 'website', 'city', 'country', 'notes'];
const LIMITS = { name: 120, email: 254, phone: 30, company: 120, jobTitle: 80, category: 50, website: 200, city: 80, country: 80, notes: 2000 };
const IMPORT_FIELDS = [...TEXT_FIELDS, 'status'];
const MAX_IMPORT_ROWS = 500;
const MAX_EXPORT_ROWS = 5000;
const EMAIL_RX = /^\S+@\S+\.\S+$/;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isAdmin = (user) => user.role === 'admin';

// Admin: whole organization. Sales rep: only customers assigned to them.
const buildScope = (user) =>
  isAdmin(user) ? { organization: user.organization } : { organization: user.organization, assignedTo: user._id };

// Only whitelisted text fields are ever read from the request body.
const pickText = (input) => {
  const out = {};
  for (const f of TEXT_FIELDS) if (typeof input[f] === 'string') out[f] = input[f].trim();
  if (out.email) out.email = out.email.toLowerCase();
  return out;
};

const assertEmailFree = async (organization, email, excludeId) => {
  const filter = { organization, email };
  if (excludeId) filter._id = { $ne: excludeId };
  if (await Customer.exists(filter)) throw new AppError('A customer with this email already exists.', 409);
};

// Admins may assign to any ACTIVE member of their own organization; reps always own what they create.
const resolveAssignee = async (user, requestedId) => {
  if (!isAdmin(user) || !requestedId) return user._id;
  const ok = await User.exists({ _id: requestedId, organization: user.organization, isActive: true });
  if (!ok) throw new AppError('Assignee must be an active member of your organization.', 400);
  return requestedId;
};

const listCustomers = async (user, query = {}) => {
  const { page = 1, limit = 10, search, category, status, assignedTo, sort = 'createdAt', order = 'desc' } = query;
  const scope = buildScope(user);
  const filter = { ...scope };

  if (typeof search === 'string' && search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { company: rx }];
  }
  if (typeof category === 'string' && category) filter.category = category;
  if (status) filter.status = status;
  if (isAdmin(user) && assignedTo) filter.assignedTo = assignedTo === 'unassigned' ? null : assignedTo;

  const direction = order === 'asc' ? 1 : -1;
  const [customers, total, categories] = await Promise.all([
    Customer.find(filter)
      .sort({ [sort]: direction, _id: direction }) // _id keeps pagination stable
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('assignedTo', 'name')
      .lean(),
    Customer.countDocuments(filter),
    Customer.distinct('category', scope), // options for the category filter
  ]);

  return { customers, total, page, pages: Math.max(1, Math.ceil(total / limit)), categories: categories.filter(Boolean).sort() };
};

const getCustomer = async (user, id) => {
  const customer = await Customer.findOne({ _id: id, ...buildScope(user) })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name')
    .lean();
  if (!customer) throw new AppError('Customer not found.', 404);

  // Reps only see deals they own and activities assigned to them.
  const dealFilter = { organization: user.organization, customer: customer._id, ...(isAdmin(user) ? {} : { owner: user._id }) };
  const activityFilter = { organization: user.organization, customer: customer._id, ...(isAdmin(user) ? {} : { assignedTo: user._id }) };

  const [deals, activities, byStage] = await Promise.all([
    Deal.find(dealFilter).sort({ createdAt: -1 }).limit(20).select('title value stage expectedCloseDate closedAt owner').populate('owner', 'name').lean(),
    Activity.find(activityFilter).sort({ dueDate: -1 }).limit(20).select('title type status priority dueDate').lean(),
    Deal.aggregate([{ $match: dealFilter }, { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } }]),
  ]);

  const stats = { totalDeals: 0, openDeals: 0, openValue: 0, wonValue: 0 };
  for (const r of byStage) {
    stats.totalDeals += r.count;
    if (Deal.OPEN_STAGES.includes(r._id)) {
      stats.openDeals += r.count;
      stats.openValue += r.value;
    } else if (r._id === 'won') stats.wonValue += r.value;
  }

  return { customer, stats, deals, activities };
};

const createCustomer = async (user, input) => {
  const data = Object.fromEntries(Object.entries(pickText(input)).filter(([, v]) => v)); // drop empty strings
  if (data.email) await assertEmailFree(user.organization, data.email);
  const assignedTo = await resolveAssignee(user, input.assignedTo);

  const customer = await Customer.create({
    ...data,
    status: input.status || 'active',
    organization: user.organization, // never from the request
    assignedTo,
    createdBy: user._id,
  });
  return customer.populate('assignedTo', 'name email');
};

const updateCustomer = async (user, id, input) => {
  const customer = await Customer.findOne({ _id: id, ...buildScope(user) });
  if (!customer) throw new AppError('Customer not found.', 404);

  const fields = pickText(input);
  if (fields.email && fields.email !== customer.email) await assertEmailFree(user.organization, fields.email, customer._id);

  for (const [key, value] of Object.entries(fields)) customer[key] = value || undefined; // '' clears the field
  if (input.status) customer.status = input.status;
  if (isAdmin(user) && input.assignedTo) customer.assignedTo = await resolveAssignee(user, input.assignedTo);

  await customer.save();
  return customer.populate('assignedTo', 'name email');
};

const deleteCustomer = async (user, id) => {
  const customer = await Customer.findOne({ _id: id, ...buildScope(user) });
  if (!customer) throw new AppError('Customer not found.', 404);

  if (await Deal.exists({ organization: user.organization, customer: customer._id })) {
    throw new AppError('This customer has deals, so it cannot be deleted. Mark it as inactive instead.', 409);
  }
  await customer.deleteOne();
  await Activity.updateMany({ organization: user.organization, customer: customer._id }, { $unset: { customer: 1 } });
};

// ---------- CSV export ----------
const EXPORT_COLUMNS = [...TEXT_FIELDS.slice(0, 1), ...TEXT_FIELDS.slice(1), 'status', 'assignedTo', 'createdAt'];

// Cells that start with = + - @ can run as formulas in Excel; the apostrophe neutralizes them.
const safeCell = (v) => (typeof v === 'string' && /^[=+\-@\t\r]/.test(v) ? `'${v}` : v ?? '');

const exportCsv = async (user) => {
  const customers = await Customer.find(buildScope(user)).sort({ name: 1 }).limit(MAX_EXPORT_ROWS).populate('assignedTo', 'name').lean();
  const rows = customers.map((c) => ({
    ...Object.fromEntries(TEXT_FIELDS.map((f) => [f, safeCell(c[f])])),
    status: c.status,
    assignedTo: safeCell(c.assignedTo?.name),
    createdAt: c.createdAt.toISOString(),
  }));
  return stringify(rows, { header: true, columns: EXPORT_COLUMNS });
};

// ---------- CSV import ----------
const HEADER_MAP = Object.fromEntries(IMPORT_FIELDS.map((f) => [f.toLowerCase(), f]));
const normalizeHeader = (h) => HEADER_MAP[String(h).toLowerCase().replace(/[^a-z0-9]/g, '')] || false; // false = ignore column

const sanitizeRow = (record) => {
  const data = {};
  const problems = [];
  for (const f of IMPORT_FIELDS) {
    if (record[f] == null) continue;
    const value = String(record[f]).trim().replace(/^'(?=[=+\-@])/, ''); // undo the export's formula guard
    if (!value) continue;
    if (LIMITS[f] && value.length > LIMITS[f]) problems.push(`${f} is too long (max ${LIMITS[f]})`);
    else data[f] = value;
  }
  if (!data.name) problems.push('name is required');
  if (data.email) {
    data.email = data.email.toLowerCase();
    if (!EMAIL_RX.test(data.email)) problems.push('email is not valid');
  }
  if (data.status) {
    data.status = data.status.toLowerCase();
    if (!Customer.STATUSES.includes(data.status)) problems.push('status must be active or inactive');
  }
  return { data, problems };
};

const importCsv = async (user, buffer) => {
  let records;
  try {
    records = parse(buffer, { columns: (header) => header.map(normalizeHeader), skip_empty_lines: true, trim: true, bom: true, relax_column_count: true });
  } catch {
    throw new AppError('Could not read the file. Make sure it is a valid CSV with a header row.', 400);
  }
  if (!records.length) throw new AppError('The file has no data rows.', 400);
  if (!('name' in records[0])) throw new AppError('The CSV must include a "name" column.', 400);
  if (records.length > MAX_IMPORT_ROWS) throw new AppError(`Too many rows. Import up to ${MAX_IMPORT_ROWS} at a time.`, 400);

  const errors = [];
  const valid = [];
  const seen = new Set();

  records.forEach((record, i) => {
    const row = i + 2; // line number in the file (header is line 1)
    const { data, problems } = sanitizeRow(record);
    if (!problems.length && data.email) {
      if (seen.has(data.email)) problems.push('duplicate email inside the file');
      else seen.add(data.email);
    }
    if (problems.length) errors.push({ row, message: problems.join('; ') });
    else valid.push({ row, data });
  });

  // One query to find emails that already exist in this organization.
  const emails = valid.map((v) => v.data.email).filter(Boolean);
  const existing = new Set(emails.length ? await Customer.distinct('email', { organization: user.organization, email: { $in: emails } }) : []);
  const toInsert = [];
  for (const { row, data } of valid) {
    if (data.email && existing.has(data.email)) errors.push({ row, message: 'a customer with this email already exists' });
    else toInsert.push({ ...data, organization: user.organization, assignedTo: user._id, createdBy: user._id });
  }

  if (toInsert.length) await Customer.insertMany(toInsert);

  errors.sort((a, b) => a.row - b.row);
  return { created: toInsert.length, skipped: errors.length, errors: errors.slice(0, 50) };
};

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, exportCsv, importCsv };