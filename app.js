// Starts the app and switches between screens.
import * as screens from './screens.js?v=15';
import * as store from './store.js';
import * as eng from './engine.js?v=3';
import * as demo from './demo.js';
import { h, icon } from './dom.js?v=2';
import { closeModal } from './ui.js?v=8';

const view = document.getElementById('view');
const banner = document.getElementById('banner');
const backbar = document.getElementById('backbar') || (() => { const d = document.createElement('div'); d.id = 'backbar'; d.className = 'backbar'; banner.after(d); return d; })();
const draft = {};
let products = [];

function go(hash) {
  if (location.hash === hash) render();
  else location.hash = hash;
}

function refresh(hash) {
  if (hash && location.hash !== hash) location.hash = hash;
  else render();
}

function dueCheckinHash() {
  const data = store.load();
  if (!data.tracked.length) return '#/welcome';
  const weekNow = t => Math.min(eng.TOTAL_WEEKS, Math.max(eng.currentWeek(t.startDate), ...data.checkins.filter(c => c.productId === t.productId).map(c => c.week)));
  const due = data.tracked.find(t => !store.getCheckin(data, t.productId, weekNow(t)));
  const t = due || data.tracked[0];
  return `#/checkin/${t.productId}/${weekNow(t)}`;
}

function setNav(route) {
  const map = { timeline: 'timeline', month: 'timeline', checkin: 'checkin', done: 'checkin', consult: 'timeline', progress: 'progress', settings: 'settings' };
  const active = map[route] || '';
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('is-active', a.dataset.nav === active);
    if (a.dataset.nav === 'checkin') a.setAttribute('href', dueCheckinHash());
  });
  const hasData = store.load().tracked.length > 0;
  const cta = document.querySelector('.topbar-cta');
  if (cta) { cta.textContent = hasData ? 'My plan' : 'Start'; cta.setAttribute('href', hasData ? '#/timeline' : '#/pick'); }
  document.body.classList.toggle('no-nav', !hasData || ['welcome', 'pick', 'dates'].includes(route));
  document.body.classList.toggle('is-landing', route === 'welcome');
}

function drawBanner() {
  banner.replaceChildren();
  if (!store.isDemo()) return;
  const data = store.load();
  const week = data.tracked.length ? eng.currentWeek(data.tracked[0].startDate) : 8;
  const range = h('input', { type: 'range', min: '1', max: '13', step: '1', value: String(week), id: 'demo-week', 'aria-label': 'Preview week' });
  const out = h('output', { for: 'demo-week', text: `Week ${week}` });
  range.addEventListener('input', () => { out.textContent = `Week ${range.value}`; });
  range.addEventListener('change', () => { demo.fill(parseInt(range.value, 10)); render(); });
  banner.append(h('div', { class: 'demo-bar' },
    h('span', { class: 'demo-tag', text: 'Sample data' }),
    h('label', { class: 'demo-label', for: 'demo-week', text: 'Preview week' }), range, out,
    h('button', { class: 'btn btn-small btn-quiet', type: 'button', text: 'Leave sample', onclick: () => { demo.clear(); refresh('#/'); } })));
}

// Remembers the screens visited in this tab, so Back returns to the previous one.
function readStack() {
  try { return JSON.parse(sessionStorage.getItem('steady.stack') || '[]'); } catch (e) { return []; }
}
function writeStack(st) {
  try { sessionStorage.setItem('steady.stack', JSON.stringify(st.slice(-30))); } catch (e) { /* ignore */ }
}
function track(hash) {
  const st = readStack();
  if (st.length > 1 && st[st.length - 2] === hash) st.pop();
  else if (st[st.length - 1] !== hash) st.push(hash);
  writeStack(st);
  return st;
}

function parentOf(route, parts) {
  const pid = parts[1];
  switch (route) {
    case 'pick': return '#/welcome';
    case 'dates': return '#/pick';
    case 'checkin': return parts[2] === '0' ? '#/dates' : `#/timeline/${pid}`;
    case 'month': case 'done': case 'consult': case 'progress': return pid ? `#/timeline/${pid}` : '#/timeline';
    case 'settings': return '#/timeline';
    case 'timeline': return '#/welcome';
    default: return '#/welcome';
  }
}

const BACK_LABEL = { pick: 'Back', dates: 'Back', checkin: 'Back', timeline: 'Back', month: 'Back to timeline', done: 'Back to timeline', progress: 'Back', consult: 'Back', settings: 'Back' };

function drawBack(route, parts, stack) {
  backbar.replaceChildren();
  if (route === 'welcome') return;
  const btn = h('button', { class: 'backbtn', type: 'button', 'aria-label': 'Go back' },
    h('span', { class: 'backbtn-mark', 'aria-hidden': 'true', text: '‹' }), h('span', { text: BACK_LABEL[route] || 'Back' }));
  btn.addEventListener('click', () => {
    if (stack.length > 1) history.back();
    else go(parentOf(route, parts));
  });
  backbar.append(btn);
}

function render() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
  let route = parts[0] || '';
  const data = store.load();
  if (!route) route = data.tracked.length ? 'timeline' : 'welcome';
  const stack = track(location.hash || '#/');
  closeModal();
  view.replaceChildren();
  drawBanner();
  drawBack(route, parts, stack);
  setNav(route);
  const fn = {
    welcome: () => screens.welcome(view),
    pick: () => screens.pick(view),
    dates: () => screens.dates(view),
    checkin: () => screens.checkin(view, parts[1], parts[2]),
    timeline: () => screens.timeline(view, parts[1]),
    month: () => screens.month(view, parts[1], parts[2]),
    done: () => screens.done(view, parts[1], parts[2]),
    progress: () => screens.progress(view, parts[1]),
    consult: () => screens.consult(view, parts[1]),
    settings: () => screens.settings(view)
  }[route];
  if (fn) fn(); else screens.welcome(view);
  view.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

// "Add to home screen" button in the header (phone) and side menu (laptop).
let installPrompt = null;
const a2hsButtons = [];
function setupAddToHome() {
  const make = cls => {
    const b = h('button', { class: 'a2hs ' + cls, type: 'button' }, icon('addhome', 'icon'), h('span', { text: 'Add to home screen' }));
    b.addEventListener('click', async () => {
      if (installPrompt) {
        installPrompt.prompt();
        try { await installPrompt.userChoice; } catch (e) { /* ignore */ }
        installPrompt = null;
      } else {
        screens.homeScreenSheet();
      }
    });
    a2hsButtons.push(b);
    return b;
  };
  const topbar = document.querySelector('.topbar');
  const cta = document.querySelector('.topbar-cta');
  if (topbar) topbar.insertBefore(make('a2hs-top'), cta || null);
  const note = document.querySelector('.sidenav-note');
  if (note) note.before(make('a2hs-side'));
  const hide = () => a2hsButtons.forEach(b => { b.hidden = true; });
  if (screens.isStandalone()) hide();
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; });
  window.addEventListener('appinstalled', () => { installPrompt = null; hide(); });
}

async function start() {
  try {
    const res = await fetch('products.json', { cache: 'no-cache' });
    const json = await res.json();
    products = json.products;
  } catch (e) {
    view.replaceChildren(h('section', { class: 'screen' }, h('h1', { class: 'title', text: 'Steady couldn\'t load' }), h('p', { class: 'lede', text: 'Check your connection and refresh the page.' })));
    return;
  }
  screens.init({ products, draft, go, refresh });
  setupAddToHome();
  window.addEventListener('hashchange', render);
  render();
}

start();
