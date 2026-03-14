// ── Date helpers ──────────────────────────────────────────────────────────────

export function isToday(dateStr) {
  if (!dateStr) return true;
  const d   = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth()    === now.getMonth()    &&
    d.getDate()     === now.getDate()
  );
}

export function isFuture(dateStr) {
  if (!dateStr) return false;
  const d   = new Date(dateStr);
  const now = new Date();
  // strip time — compare dates only
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day   = new Date(d.getFullYear(),   d.getMonth(),   d.getDate());
  return day > today;
}

export function todayLabel() {
  return new Date().toLocaleDateString([], {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
  });
}

function getWeekBounds() {
  const now        = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday = 0
  startOfWeek.setHours(0, 0, 0, 0);
  return { from: startOfWeek, to: now };
}

function getYearBounds() {
  const now = new Date();
  return { from: new Date(now.getFullYear(), 0, 1), to: now };
}

function inRange(dateStr, from, to) {
  if (!dateStr) return true;
  const d = new Date(dateStr);
  if (from && d < from) return false;
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
}

export function applyDateRange(tasks, dateRange, customFrom, customTo) {
  if (dateRange === 'week') {
    const { from, to } = getWeekBounds();
    return tasks.filter((a) => inRange(a.pickup?.scheduledTime, from, to));
  }
  if (dateRange === 'year') {
    const { from, to } = getYearBounds();
    return tasks.filter((a) => inRange(a.pickup?.scheduledTime, from, to));
  }
  if (dateRange === 'custom') {
    const from = customFrom ? new Date(customFrom) : null;
    const to   = customTo   ? new Date(customTo)   : null;
    return tasks.filter((a) => inRange(a.pickup?.scheduledTime, from, to));
  }
  return tasks; // 'all'
}

// ── Status filter ─────────────────────────────────────────────────────────────

export const STATUS_FILTER_OPTIONS = [
  { value: 'active',    label: 'Active (Assigned + In Progress)' },
  { value: 'assigned',  label: 'Assigned' },
  { value: 'inpicked',  label: 'In Progress' },
  { value: 'delivered', label: 'Delivered / Verified' },
  { value: 'all',       label: 'All' },
];

export function applyStatusFilter(assignment, statusFilter) {
  const s = assignment.status;
  if (statusFilter === 'active' || statusFilter === '')
    return !['completed', 'rejected', 'delivered', 'verified'].includes(s);
  if (statusFilter === 'assigned')  return s === 'assigned';
  if (statusFilter === 'inpicked')  return s === 'inpicked';
  if (statusFilter === 'delivered') return ['delivered', 'verified', 'completed'].includes(s);
  return true; // 'all'
}

// ── Card sort order ──────────────────────────────────────────────────────────

// Priority rank: lower = shown first.
// Today's in-progress (0) → today's assigned (1) → today's other (2) → past tasks (3)
const STATUS_PRIORITY = { inpicked: 0, assigned: 1 };

export function sortAssignments(list) {
  return [...list].sort((a, b) => {
    const aToday = isToday(a.pickup?.scheduledTime);
    const bToday = isToday(b.pickup?.scheduledTime);

    // Non-today cards always go after today cards
    if (aToday !== bToday) return aToday ? -1 : 1;

    if (aToday && bToday) {
      // Both today: sort by status priority
      const aPri = STATUS_PRIORITY[a.status] ?? 2;
      const bPri = STATUS_PRIORITY[b.status] ?? 2;
      if (aPri !== bPri) return aPri - bPri;
    }

    // Same bucket: sort by scheduled time ascending (earlier pickups first)
    const aTime = a.pickup?.scheduledTime ? new Date(a.pickup.scheduledTime).getTime() : Infinity;
    const bTime = b.pickup?.scheduledTime ? new Date(b.pickup.scheduledTime).getTime() : Infinity;
    return aTime - bTime;
  });
}

// ── Date range filter options ─────────────────────────────────────────────────

export const DATE_RANGE_OPTIONS = [
  { value: 'all',    label: 'All Previous' },
  { value: 'week',   label: 'This Week' },
  { value: 'year',   label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];
