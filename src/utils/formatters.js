export function formatDate(d, opts) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDayLong(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function daysBetween(s, e) {
  if (!s || !e) return 0;
  return Math.max(1, Math.round((new Date(e) - new Date(s)) / 86400000) + 1);
}

export function nightsBetween(s, e) {
  if (!s || !e) return 0;
  return Math.max(0, Math.round((new Date(e) - new Date(s)) / 86400000));
}
