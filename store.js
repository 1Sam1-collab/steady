// Saves and loads her plan and check-ins in this browser only.
const REAL_KEY = 'steady.v1';
const DEMO_KEY = 'steady.demo.v1';
const MODE_KEY = 'steady.mode';

function empty() {
  return {
    version: 1,
    profile: { reminderTime: '21:00', createdAt: new Date().toISOString(), homeScreenDismissed: false, privacyNoted: false },
    tracked: [],
    checkins: []
  };
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); return true; } catch (e) { return false; }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

export function isDemo() {
  return safeGet(MODE_KEY) === 'demo';
}

export function setDemo(on) {
  if (on) safeSet(MODE_KEY, 'demo');
  else { safeRemove(MODE_KEY); safeRemove(DEMO_KEY); }
}

function key() {
  return isDemo() ? DEMO_KEY : REAL_KEY;
}

export function load() {
  const raw = safeGet(key());
  if (!raw) return empty();
  try {
    const data = JSON.parse(raw);
    if (!data || data.version !== 1) return empty();
    data.profile = Object.assign(empty().profile, data.profile || {});
    data.tracked = Array.isArray(data.tracked) ? data.tracked : [];
    data.checkins = Array.isArray(data.checkins) ? data.checkins : [];
    return data;
  } catch (e) {
    return empty();
  }
}

export function save(data) {
  return safeSet(key(), JSON.stringify(data));
}

export function saveDemo(data) {
  return safeSet(DEMO_KEY, JSON.stringify(data));
}

export function hasRealData() {
  const raw = safeGet(REAL_KEY);
  if (!raw) return false;
  try { return (JSON.parse(raw).tracked || []).length > 0; } catch (e) { return false; }
}

export function saveCheckin(checkin) {
  const data = load();
  data.checkins = data.checkins.filter(c => !(c.productId === checkin.productId && c.week === checkin.week));
  data.checkins.push(checkin);
  data.checkins.sort((a, b) => a.week - b.week);
  return save(data) ? data : null;
}

export function getCheckin(data, productId, week) {
  return data.checkins.find(c => c.productId === productId && c.week === week) || null;
}

export function checkinsFor(data, productId) {
  return data.checkins.filter(c => c.productId === productId).sort((a, b) => a.week - b.week);
}

export function removeProduct(productId) {
  const data = load();
  data.tracked = data.tracked.filter(t => t.productId !== productId);
  const removed = data.checkins.filter(c => c.productId === productId);
  data.checkins = data.checkins.filter(c => c.productId !== productId);
  save(data);
  return removed.map(c => c.photoId).filter(Boolean);
}

export function deleteAll() {
  safeRemove(REAL_KEY);
  safeRemove(DEMO_KEY);
  safeRemove(MODE_KEY);
}
