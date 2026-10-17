// Week maths, trends and the doctor-prompt rules.
export const TOTAL_WEEKS = 13;
const DAY = 24 * 60 * 60 * 1000;

export function parseDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function today() {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

// Week 1 = days 0 to 6 after the start date. Capped at 13.
export function currentWeek(startIso, now = today()) {
  const days = Math.floor((now - parseDate(startIso)) / DAY);
  if (days < 0) return 1;
  return Math.min(TOTAL_WEEKS, Math.floor(days / 7) + 1);
}

export function daysSinceStart(startIso, now = today()) {
  return Math.floor((now - parseDate(startIso)) / DAY);
}

export function weekEndDate(startIso, week) {
  return new Date(parseDate(startIso).getTime() + (week * 7 - 1) * DAY);
}

export function monthOfWeek(week) {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

export function weeksOfMonth(month) {
  if (month === 1) return [1, 2, 3, 4];
  if (month === 2) return [5, 6, 7, 8];
  if (month === 3) return [9, 10, 11, 12, 13];
  return [];
}

export function formatDate(date) {
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// All values are stored 1 (worst) to 5 (best).
export function trend(checkins, signId) {
  return checkins
    .filter(c => c.ratings && typeof c.ratings[signId] === 'number')
    .map(c => ({ week: c.week, value: c.ratings[signId] }));
}

function baselineOf(checkins) {
  return checkins.find(c => c.week === 0) || null;
}

// Returns { consult: bool, reason, kind } for the latest check-in.
export function checkRules(product, checkins) {
  const real = checkins.filter(c => c.week > 0).sort((a, b) => a.week - b.week);
  const latest = real[real.length - 1];
  if (!latest) return { consult: false };
  // A "Yes" counts whether it was on the latest week or on the week saved most recently
  // (for example, filling in a missed week or redoing an earlier one).
  const lastSaved = real.reduce((a, c) => ((c.savedAt || 0) >= (a.savedAt || 0) ? c : a), real[0]);
  if (latest.redFlag || lastSaved.redFlag) {
    const flagged = latest.redFlag ? latest : lastSaved;
    return { consult: true, kind: 'redflag', reason: `You said yes to the warning-sign question in your Week ${flagged.week} check-in. That is worth checking with a doctor rather than waiting.` };
  }
  const base = baselineOf(checkins);
  for (const rule of product.rules || []) {
    if (rule.type === 'improveBy' && base && latest.week >= rule.week) {
      // Better than the start, or already at the best point of the scale, both count as fine.
      const anyBetter = rule.signs.some(s => (latest.ratings[s] || 0) > (base.ratings[s] || 0) || (latest.ratings[s] || 0) >= 5);
      if (!anyBetter) return { consult: true, kind: 'milestone', reason: rule.reason };
    }
    if (rule.type === 'darkerTwice' && base && real.length >= 2) {
      const last2 = real.slice(-2);
      const consecutive = last2[1].week - last2[0].week === 1;
      const darker = last2.every(c => (c.ratings[rule.sign] || 5) < (base.ratings[rule.sign] || 0));
      if (consecutive && darker) return { consult: true, kind: 'trend', reason: rule.reason };
    }
    if (rule.type === 'lowFor' && real.length >= rule.weeks) {
      const lastN = real.slice(-rule.weeks);
      const consecutive = lastN[lastN.length - 1].week - lastN[0].week === rule.weeks - 1;
      const low = lastN.every(c => (c.ratings[rule.sign] || 5) <= rule.max);
      if (consecutive && low) return { consult: true, kind: 'trend', reason: rule.reason };
    }
  }
  return { consult: false };
}

// One plain sentence about the main sign for the done screen.
export function summaryLine(product, checkins, week) {
  const sign = product.signs.find(s => s.id === product.mainSign);
  const base = baselineOf(checkins);
  const now = checkins.find(c => c.week === week);
  if (!sign || !now) return '';
  const word = v => sign.anchors[v - 1] || '';
  if (!base) return `${sign.label}: "${word(now.ratings[sign.id])}" this week.`;
  const b = base.ratings[sign.id];
  const n = now.ratings[sign.id];
  if (n > b) return `${sign.label}: "${word(b)}" when you started, "${word(n)}" now.`;
  if (n === b) return `${sign.label}: "${word(n)}", the same as when you started.`;
  return `${sign.label}: "${word(b)}" when you started, "${word(n)}" this week.`;
}

export function statusLine(product, checkins, week) {
  const rule = checkRules(product, checkins);
  if (rule.consult) return { tone: 'consult', text: 'This one is worth a doctor\'s view.' };
  const exp = product.expectedChangeWeek;
  if (!exp) return { tone: 'ok', text: 'Logged. Keep tracking how you feel.' };
  if (week < exp) {
    const left = exp - week;
    return { tone: 'ok', text: `You're on track. Be Bodywise's main milestone is ${left} week${left === 1 ? '' : 's'} away.` };
  }
  return { tone: 'ok', text: 'Change is showing compared with when you started.' };
}

export function nextMilestone(product, week) {
  const month = monthOfWeek(week);
  return (product.months || []).find(m => m.month > month && (m.type === 'brand' || m.type === 'check')) || null;
}
