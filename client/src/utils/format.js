// Single place to change the display currency (it will become an organization setting later).
const CURRENCY = 'USD';

export const formatCurrency = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(n || 0);

export const formatCompact = (n) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—');

export const humanize = (s = '') => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());