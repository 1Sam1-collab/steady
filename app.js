// Starts the app and switches between screens.
import * as screens from './screens.js';
import * as store from './store.js';
import * as eng from './engine.js';
import * as demo from './demo.js';
import { h } from './dom.js';

const view = document.getElementById('view');
const banner = document.getElementById('banner');
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
  const due = data.tracked.find(t => !store.getCheckin(data, t.productId, eng.currentWeek(t.startDate)));
  const t = due || data.tracked[0];
  return `#/checkin/${t.productId}/${eng.currentWeek(t.startDate)}`;
}

function setNav(route) {
  const map = { timeline: 'timeline', month: 'timeline', checkin: 'checkin', done: 'checkin', consult: 'timeline', progress: 'progress', settings: 'settings' };
  const active = map[route] || '';
  document.querySelectorAll('[data-nav]').forEach(a => {
    a.classList.toggle('is-active', a.dataset.nav === active);
    if (a.dataset.nav === 'checkin') a.setAttribute('href', dueCheckinHash());
  });
  const hasData = store.load().tracked.length > 0;
  document.body.classList.toggle('no-nav', !hasData || ['welcome', 'pick', 'dates'].includes(route));
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

function render() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
  let route = parts[0] || '';
  const data = store.load();
  if (!route) route = data.tracked.length ? 'timeline' : 'welcome';
  view.replaceChildren();
  drawBanner();
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

async function start() {
  try {
    const res = await fetch('data/products.json', { cache: 'no-cache' });
    const json = await res.json();
    products = json.products;
  } catch (e) {
    view.replaceChildren(h('section', { class: 'screen' }, h('h1', { class: 'title', text: 'Steady couldn\'t load' }), h('p', { class: 'lede', text: 'Check your connection and refresh the page.' })));
    return;
  }
  screens.init({ products, draft, go, refresh });
  window.addEventListener('hashchange', render);
  render();
}

start();
