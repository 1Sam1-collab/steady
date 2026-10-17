// Builds one .ics file with daily usage reminders and weekly check-in reminders.
import { parseDate, today, TOTAL_WEEKS } from './engine.js';

function esc(text) {
  return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function stamp(date, hh, mm) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${p(hh)}${p(mm)}00`;
}

function utcStamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export function buildIcs(products, tracked, reminderTime) {
  const [hh, mm] = (reminderTime || '21:00').split(':').map(Number);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Steady//Progress Companion//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  const names = tracked.map(t => (products.find(p => p.id === t.productId) || {}).short).filter(Boolean);
  const start = today();
  lines.push(
    'BEGIN:VEVENT',
    `UID:steady-daily-${Date.now()}@steady`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART:${stamp(start, hh, mm)}`,
    'DURATION:PT10M',
    `RRULE:FREQ=DAILY;COUNT=${TOTAL_WEEKS * 7}`,
    `SUMMARY:${esc('Steady: use your ' + names.join(', '))}`,
    `DESCRIPTION:${esc('Use each product as directed on its pack.')}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc('Steady reminder')}`, 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT'
  );
  tracked.forEach(t => {
    const p = products.find(x => x.id === t.productId);
    if (!p) return;
    const first = new Date(parseDate(t.startDate).getTime() + 6 * 86400000);
    lines.push(
      'BEGIN:VEVENT',
      `UID:steady-week-${p.id}-${Date.now()}@steady`,
      `DTSTAMP:${utcStamp()}`,
      `DTSTART:${stamp(first, hh, mm)}`,
      'DURATION:PT10M',
      `RRULE:FREQ=WEEKLY;COUNT=${TOTAL_WEEKS}`,
      `SUMMARY:${esc('Steady: weekly check-in for ' + p.short)}`,
      `DESCRIPTION:${esc('Open Steady and rate this week. It takes under a minute.')}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc('Steady check-in')}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT'
    );
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function download(icsText) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'steady-reminders.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Google Calendar links: each opens a ready-to-save repeating event.
function gStamp(date, hh, mm) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${p(hh)}${p(mm)}00`;
}

function gLink(title, details, start, hh, mm, rrule) {
  const end = new Date(start.getTime());
  const endM = mm + 10;
  const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Asia/Kolkata';
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details,
    dates: `${gStamp(start, hh, mm)}/${gStamp(end, hh + Math.floor(endM / 60), endM % 60)}`,
    ctz: tz,
    recur: `RRULE:${rrule}`
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

export function googleLinks(products, tracked, reminderTime) {
  const [hh, mm] = (reminderTime || '21:00').split(':').map(Number);
  const names = tracked.map(t => (products.find(p => p.id === t.productId) || {}).short).filter(Boolean);
  const links = [{
    label: 'Daily reminder',
    sub: names.join(', '),
    url: gLink('Steady: use your ' + names.join(', '), 'Use each product as directed on its pack.', today(), hh, mm, `FREQ=DAILY;COUNT=${TOTAL_WEEKS * 7}`)
  }];
  tracked.forEach(t => {
    const p = products.find(x => x.id === t.productId);
    if (!p) return;
    const first = new Date(parseDate(t.startDate).getTime() + 6 * 86400000);
    links.push({
      label: 'Weekly check-in',
      sub: p.short,
      url: gLink('Steady: weekly check-in for ' + p.short, 'Open Steady and rate this week. It takes under a minute.', first, hh, mm, `FREQ=WEEKLY;COUNT=${TOTAL_WEEKS}`)
    });
  });
  return links;
}
