// Draws each screen from the product file and saved data.
import { h, s, icon } from './dom.js';
import * as store from './store.js';
import * as eng from './engine.js';
import * as photos from './photos.js';
import * as cal from './calendar.js';
import * as demo from './demo.js';

const MAX_PRODUCTS = 3;
const TYPE_LABEL = { brand: 'Be Bodywise says', app: 'App note', next: 'Next milestone', check: 'Steady check' };

let ctx = null;
export function init(c) { ctx = c; }

const P = id => ctx.products.find(p => p.id === id);

function eyebrow(text) { return h('p', { class: 'eyebrow', text }); }

function backLink(label, hash) {
  return h('a', { class: 'back', href: hash, text: label });
}

function tabs(data, activeId, base) {
  if (data.tracked.length < 2) return null;
  return h('div', { class: 'tabs', role: 'tablist' },
    data.tracked.map(t => {
      const p = P(t.productId);
      if (!p) return null;
      return h('a', { class: 'tab' + (t.productId === activeId ? ' is-active' : ''), href: `#/${base}/${p.id}`, role: 'tab', 'aria-selected': t.productId === activeId ? 'true' : 'false' },
        icon(p.icon, 'icon icon-sm'), h('span', { text: p.short }));
    }));
}

function consultLink() {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'https://apps.apple.com/in/app/be-bodywise/id6446192851';
  if (/Android/i.test(ua)) return 'https://play.google.com/store/apps/details?id=com.mosaicwellness.bebodywise';
  return 'https://bebodywise.com';
}

function isStandalone() {
  return window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

/* ---------- 1. Welcome ---------- */
export function welcome(view) {
  const startDemo = () => { demo.fill(8); ctx.refresh('#/timeline'); };
  const steps = [
    ['Pick your products', 'Up to three Be Bodywise products, wherever you bought them.'],
    ['Set your start dates', 'Steady works out which week you are in, and sets your reminder time.'],
    ['Rate Week 0', 'Three quick ratings about how things are today. This is your starting point.'],
    ['Check in every week', 'Days used, three ratings, an optional photo and one warning-sign question. Under a minute.'],
    ['Watch the trend', 'Your ratings become a line, read against what Be Bodywise says to expect each month.']
  ];
  const marqueeItems = ['Pick your products', 'Set start dates', 'Rate Week 0', 'Check in every week', 'Watch the trend', 'See a doctor if needed'];
  const marqueeRow = () => h('div', { class: 'marquee-row' }, marqueeItems.map((t, i) => h('span', { class: 'marquee-item' }, h('sup', { text: String(i + 1) }), t, h('span', { class: 'marquee-arrow', 'aria-hidden': 'true', text: '/' }))));
  const months = [
    ['Month 1', 'Build the habit.', 'App note'],
    ['Month 2', 'Baby hair starts to show.', 'Be Bodywise says'],
    ['Month 3', 'Visible reduction in hair thinning.', 'Be Bodywise says']
  ];
  view.append(h('div', { class: 'landing' },
    h('section', { class: 'hero' },
      h('div', { class: 'hero-copy' },
        h('p', { class: 'hero-eyebrow', text: 'FOR BE BODYWISE CUSTOMERS' }),
        h('h1', { class: 'hero-title' }, h('span', { text: 'Week by week,' }), h('span', { text: 'see it working.' })),
        h('p', { class: 'hero-lede', text: 'Know what to expect, remember every dose, and see your progress, for up to three products.' }),
        h('div', { class: 'actions' },
          h('a', { class: 'btn btn-cream', href: '#/pick', text: 'Start' }),
          h('button', { class: 'btn btn-ghost', type: 'button', text: 'Preview with sample data', onclick: startDemo })),
        h('p', { class: 'hero-fine', text: 'No sign-up. Your answers stay on this device.' })),
      h('div', { class: 'hero-visual', 'aria-hidden': 'true' }, phoneStage(true))),
    h('div', { class: 'marquee', 'aria-label': 'How Steady works: ' + marqueeItems.join(', ') }, h('div', { class: 'marquee-track', 'aria-hidden': 'true' }, marqueeRow(), marqueeRow())),
    h('section', { class: 'journey' },
      h('p', { class: 'eyebrow', text: 'YOUR PATH THROUGH STEADY' }),
      h('h2', { class: 'section-title', text: 'Thirteen weeks, one simple path.' }),
      h('ol', { class: 'path' },
        h('span', { class: 'path-line', 'aria-hidden': 'true' }, h('span', { class: 'path-fill' })),
        steps.map(([t, d], i) => h('li', { class: 'path-step' },
          h('span', { class: 'path-node', text: String(i + 1) }),
          h('div', { class: 'path-copy' }, h('h3', { text: t }), h('p', { text: d })))),
        h('li', { class: 'path-step path-fork' },
          h('span', { class: 'path-node', text: '6' }),
          h('div', { class: 'path-copy' },
            h('h3', { text: 'Then one of two things' }),
            h('div', { class: 'fork' },
              h('div', { class: 'fork-branch is-good' }, h('p', { class: 'fork-label', text: 'ON TRACK' }), h('p', { text: 'Keep going. Each check-in tells you how far the next milestone is.' })),
              h('div', { class: 'fork-branch is-alert' }, h('p', { class: 'fork-label', text: 'WARNING SIGN OR NO CHANGE BY WEEK 13' }), h('p', { text: 'Steady suggests a Be Bodywise doctor, with one tap.' }))))))),
    h('section', { class: 'months' },
      h('p', { class: 'eyebrow', text: 'EXAMPLE: ADVANCED HAIR GROWTH SERUM' }),
      months.map(([m, t, src]) => h('div', { class: 'month-band' },
        h('p', { class: 'month-word', text: m }),
        h('div', null, h('p', { class: 'month-src', text: src }), h('p', { class: 'month-line', text: t }))))),
    h('section', { class: 'products-strip' },
      h('p', { class: 'eyebrow', text: 'WORKS WITH' }),
      h('ul', { class: 'product-names' }, ctx.products.map(p => h('li', null, icon(p.icon, 'icon'), h('span', { text: p.name }))))),
    h('section', { class: 'closer' },
      h('h2', { class: 'closer-title', text: 'Stays on your phone.' }),
      h('p', { class: 'hero-lede', text: 'No account, no uploads, no tracking. Delete everything with one tap.' }),
      h('div', { class: 'actions' },
        h('a', { class: 'btn btn-primary', href: '#/pick', text: 'Start' }),
        h('button', { class: 'btn btn-quiet', type: 'button', text: 'Preview with sample data', onclick: startDemo })))));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = view.querySelector('.stage-inner');
  const hero = view.querySelector('.hero');
  const path = view.querySelector('.path');
  const fill = view.querySelector('.path-fill');
  const stepsEls = [...view.querySelectorAll('.path-step')];
  const onScroll = () => {
    if (!document.body.contains(path)) { window.removeEventListener('scroll', onScroll); return; }
    const r = path.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.max(0, Math.min(1, (vh * 0.7 - r.top) / r.height));
    fill.style.transform = `scaleY(${p.toFixed(3)})`;
    stepsEls.forEach(el => el.classList.toggle('is-reached', el.getBoundingClientRect().top < vh * 0.7));
    if (stage && !reduce) {
      const hr = hero.getBoundingClientRect();
      const t = Math.max(0, Math.min(1, -hr.top / Math.max(1, hr.height)));
      stage.style.setProperty('--scroll', t.toFixed(3));
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (hero && stage && !reduce && window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      stage.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(2)}deg`);
      stage.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 12).toFixed(2)}deg`);
    });
    hero.addEventListener('pointerleave', () => { stage.style.setProperty('--ry', '0deg'); stage.style.setProperty('--rx', '0deg'); });
  }
}

function phoneStage(single) {
  const screenTimeline = h('div', { class: 'ph-screen' },
    h('p', { class: 'ph-eyebrow', text: 'WEEK 7 OF 13' }),
    h('p', { class: 'ph-title', text: 'Hair serum' }),
    h('div', { class: 'ph-card' }, h('p', { class: 'ph-eyebrow', text: 'MONTH 1' }), h('p', { class: 'ph-type', text: 'App note' }), h('p', { class: 'ph-text', text: 'Build the habit.' }),
      h('div', { class: 'ph-chips' }, ['W1', 'W2', 'W3', 'W4'].map(c => h('span', { class: 'ph-chip is-done', text: c })))),
    h('div', { class: 'ph-card is-now' }, h('p', { class: 'ph-eyebrow', text: 'MONTH 2' }), h('p', { class: 'ph-type', text: 'Be Bodywise says' }), h('p', { class: 'ph-text serif', text: 'Baby hair starts to show.' }),
      h('div', { class: 'ph-chips' }, ['W5', 'W6', 'W7', 'W8'].map((c, i) => h('span', { class: 'ph-chip' + (i < 2 ? ' is-done' : i === 2 ? ' is-current' : ''), text: c })))),
    h('div', { class: 'ph-card' }, h('p', { class: 'ph-eyebrow', text: 'MONTH 3' }), h('p', { class: 'ph-text serif', text: '"Visible reduction in hair thinning"' })));
  const screenCheck = h('div', { class: 'ph-screen' },
    h('p', { class: 'ph-eyebrow', text: 'WEEK 7 CHECK-IN' }),
    h('p', { class: 'ph-q', text: 'How much hair fell out this week?' }),
    h('div', { class: 'ph-scale' }, [0, 1, 2, 3, 4].map(i => h('span', { class: i < 2 ? 'is-before' : i === 2 ? 'is-on' : '' }))),
    h('div', { class: 'ph-words' }, ['Very heavy', 'A lot', 'Some', 'Very little', 'None'].map((w, i) => h('span', { class: i === 2 ? 'is-on' : '', text: w }))),
    h('p', { class: 'ph-chosen', text: 'Some' }),
    h('span', { class: 'ph-btn', text: 'Next' }));
  const pts = [[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 3], [6, 3], [7, 3]];
  const X = w => 8 + w * 11, Y = v => 70 - v * 12;
  const screenProgress = h('div', { class: 'ph-screen' },
    h('p', { class: 'ph-eyebrow', text: 'PROGRESS' }),
    h('p', { class: 'ph-title', text: 'Hair fall' }),
    h('div', { class: 'ph-chart' }, s('svg', { viewBox: '0 0 160 80' },
      s('rect', { x: 146, y: 4, width: 10, height: 66, class: 'chart-band' }),
      s('line', { x1: 4, x2: 156, y1: 58, y2: 58, class: 'chart-grid' }),
      s('line', { x1: 4, x2: 156, y1: 34, y2: 34, class: 'chart-grid' }),
      s('polyline', { points: pts.map(p => `${X(p[0])},${Y(p[1])}`).join(' '), class: 'chart-line' }),
      pts.map(p => s('circle', { cx: X(p[0]), cy: Y(p[1]), r: 2.5, class: 'chart-dot' })))),
    h('p', { class: 'ph-text', text: '"A lot" when you started, "Some" now.' }),
    h('p', { class: 'ph-type', text: 'You\'re on track.' }));
  const phone = (cls, inner) => h('div', { class: 'phone-slot ' + cls }, h('div', { class: 'phone-bob' }, h('div', { class: 'phone' }, h('span', { class: 'phone-notch' }), inner)));
  if (single) return h('div', { class: 'stage is-single' }, h('div', { class: 'stage-inner' }, phone('is-center', screenTimeline)));
  return h('div', { class: 'stage' }, h('div', { class: 'stage-inner' },
    phone('is-left', screenCheck), phone('is-center', screenTimeline), phone('is-right', screenProgress)));
}

function previewMock() {
  const card = (eb, label, text, chips, cur) => h('div', { class: 'month-card mock' },
    eyebrow(eb), h('p', { class: 'claim-type', text: label }), h('p', { class: 'claim', text }),
    h('div', { class: 'chips' }, chips.map((c, i) => h('span', { class: 'chip' + (i < cur ? ' is-done' : i === cur ? ' is-current' : ''), text: c }))));
  return h('div', { class: 'mock-stack' },
    card('MONTH 1 · WEEKS 1–4', 'App note', 'Build the habit. Visible change usually isn\'t expected yet.', ['W1', 'W2', 'W3', 'W4'], 4),
    card('MONTH 2 · WEEKS 5–8', 'Be Bodywise says', 'Baby hair starts to show.', ['W5', 'W6', 'W7', 'W8'], 2),
    card('MONTH 3 · WEEKS 9–13', 'Be Bodywise says', '"Visible reduction in hair thinning"', ['W9', 'W10', 'W11', 'W12', 'W13'], -1));
}

/* ---------- 2. Pick products ---------- */
export function pick(view) {
  const data = store.load();
  if (!ctx.draft.selected) ctx.draft.selected = data.tracked.map(t => t.productId);
  const sel = ctx.draft.selected;
  const count = h('p', { class: 'fine', 'aria-live': 'polite' });
  const cont = h('button', { class: 'btn btn-primary', type: 'button', text: 'Continue', onclick: () => { if (sel.length) ctx.go('#/dates'); } });
  const update = () => {
    count.textContent = sel.length ? `${sel.length} of ${MAX_PRODUCTS} chosen` : `Choose up to ${MAX_PRODUCTS}`;
    cont.disabled = sel.length === 0;
  };
  const list = h('div', { class: 'product-grid' }, ctx.products.map(p => {
    const btn = h('button', { class: 'product-card' + (sel.includes(p.id) ? ' is-selected' : ''), type: 'button', 'aria-pressed': sel.includes(p.id) ? 'true' : 'false' },
      icon(p.icon, 'icon icon-lg'),
      h('span', { class: 'product-name', text: p.name }),
      h('span', { class: 'product-concern', text: p.concern }));
    btn.addEventListener('click', () => {
      const i = sel.indexOf(p.id);
      if (i >= 0) sel.splice(i, 1);
      else if (sel.length < MAX_PRODUCTS) sel.push(p.id);
      else { count.textContent = `You can track up to ${MAX_PRODUCTS} products at a time.`; return; }
      btn.classList.toggle('is-selected');
      btn.setAttribute('aria-pressed', sel.includes(p.id) ? 'true' : 'false');
      update();
    });
    return btn;
  }));
  update();
  view.append(h('section', { class: 'screen' },
    eyebrow('STEP 1 OF 3'),
    h('h1', { class: 'title', text: 'Which products are you using?' }),
    h('p', { class: 'lede', text: 'Pick up to three. A pack, like the hair serum with gummies, counts as two.' }),
    list,
    h('div', { class: 'sticky-actions' }, count, cont)));
}

/* ---------- 3. Start dates and reminder time ---------- */
export function dates(view) {
  const data = store.load();
  const sel = ctx.draft.selected || data.tracked.map(t => t.productId);
  if (!sel.length) { ctx.go('#/pick'); return; }
  const todayIso = eng.isoDate(eng.today());
  const inputs = {};
  const rows = sel.map(id => {
    const p = P(id);
    const existing = data.tracked.find(t => t.productId === id);
    const input = h('input', { type: 'date', class: 'field', max: todayIso, value: existing ? existing.startDate : todayIso, id: `d-${id}` });
    inputs[id] = input;
    return h('div', { class: 'date-row' }, icon(p.icon, 'icon'),
      h('label', { class: 'date-label', for: `d-${id}` }, h('span', { class: 'product-name', text: p.name }), h('span', { class: 'fine', text: 'When did you start?' })),
      input);
  });
  const time = h('input', { type: 'time', class: 'field', value: data.profile.reminderTime || '21:00', id: 'remind' });
  const err = h('p', { class: 'error', 'aria-live': 'polite' });
  const save = () => {
    const tracked = [];
    for (const id of sel) {
      const v = inputs[id].value;
      if (!v) { err.textContent = 'Please add a start date for each product.'; return; }
      if (v > todayIso) { err.textContent = 'A start date can\'t be in the future.'; return; }
      tracked.push({ productId: id, startDate: v });
    }
    const d = store.load();
    const removed = d.tracked.filter(t => !sel.includes(t.productId)).map(t => t.productId);
    removed.forEach(id => { d.checkins = d.checkins.filter(c => c.productId !== id); });
    d.tracked = tracked;
    d.profile.reminderTime = time.value || '21:00';
    d.profile.privacyNoted = true;
    store.save(d);
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    ctx.draft.selected = null;
    const needBaseline = tracked.find(t => !store.getCheckin(d, t.productId, 0));
    ctx.go(needBaseline ? `#/checkin/${needBaseline.productId}/0` : '#/timeline');
  };
  view.append(h('section', { class: 'screen' },
    eyebrow('STEP 2 OF 3'),
    h('h1', { class: 'title', text: 'Start dates and reminders' }),
    h('div', { class: 'stack' }, rows),
    h('div', { class: 'date-row' }, icon('calendar', 'icon'),
      h('label', { class: 'date-label', for: 'remind' }, h('span', { class: 'product-name', text: 'Daily reminder time' }), h('span', { class: 'fine', text: 'Used when you add reminders to your calendar' })),
      time),
    h('p', { class: 'note', text: 'Your answers and photos stay on this device. Nothing is uploaded. If you clear your browser data or change phones, your history is gone.' }),
    err,
    h('div', { class: 'sticky-actions' }, h('button', { class: 'btn btn-primary', type: 'button', text: 'Continue', onclick: save }))));
}

/* ---------- 4 and 7. Check-in (Week 0 baseline uses the same flow) ---------- */
export function checkin(view, productId, weekStr) {
  const p = P(productId);
  const data = store.load();
  const t = data.tracked.find(x => x.productId === productId);
  if (!p || !t) { ctx.go('#/timeline'); return; }
  const week = Math.max(0, Math.min(eng.TOTAL_WEEKS, parseInt(weekStr, 10) || 0));
  const existing = store.getCheckin(data, productId, week);
  const answer = existing ? JSON.parse(JSON.stringify(existing)) : { productId, week, doses: null, ratings: {}, redFlag: null, photoId: null };
  let pendingFile = null;
  const steps = [];
  if (week > 0) steps.push('doses');
  p.signs.forEach(sg => steps.push('sign:' + sg.id));
  if (p.photo) steps.push('photo');
  if (week > 0) steps.push('redflag');
  let i = 0;
  const cur = eng.currentWeek(t.startDate);
  const body = h('div', { class: 'step-body' });
  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' });
  const next = h('button', { class: 'btn btn-primary', type: 'button' });
  const back = h('button', { class: 'btn btn-quiet', type: 'button', text: 'Previous question' });
  const err = h('p', { class: 'error', 'aria-live': 'polite' });

  const ready = key => {
    if (key === 'doses') return answer.doses !== null;
    if (key.startsWith('sign:')) return typeof answer.ratings[key.slice(5)] === 'number';
    if (key === 'redflag') return answer.redFlag !== null;
    return true;
  };

  function draw() {
    body.replaceChildren();
    dots.replaceChildren(...steps.map((_, k) => h('span', { class: 'dot' + (k < i ? ' is-done' : k === i ? ' is-current' : '') })));
    err.textContent = '';
    const key = steps[i];
    if (key === 'doses') {
      body.append(h('h2', { class: 'question', text: `On how many of the last 7 days did you use your ${p.short.toLowerCase()}?` }),
        h('div', { class: 'dose-chips', role: 'radiogroup', 'aria-label': 'Days used' },
          [0, 1, 2, 3, 4, 5, 6, 7].map(n => {
            const b = h('button', { class: 'dose' + (answer.doses === n ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': answer.doses === n ? 'true' : 'false', text: String(n) });
            b.addEventListener('click', () => { answer.doses = n; draw(); });
            return b;
          })));
    } else if (key.startsWith('sign:')) {
      const sg = p.signs.find(x => x.id === key.slice(5));
      body.append(eyebrow(sg.label.toUpperCase()), h('h2', { class: 'question', text: sg.question }), scale(sg, answer.ratings[sg.id], v => { answer.ratings[sg.id] = v; draw(); }));
    } else if (key === 'photo') {
      const preview = h('div', { class: 'photo-preview' });
      const file = h('input', { type: 'file', accept: 'image/*', class: 'visually-hidden', id: 'photo-in' });
      const showBlob = blob => { preview.replaceChildren(h('img', { src: URL.createObjectURL(blob), alt: `Your Week ${week} photo` })); };
      if (pendingFile) showBlob(pendingFile);
      else if (answer.photoId) { preview.append(h('div', { class: 'skeleton skeleton-photo' })); photos.getPhoto(answer.photoId).then(b => { if (b) showBlob(b); else preview.replaceChildren(); }); }
      file.addEventListener('change', () => { if (file.files && file.files[0]) { pendingFile = file.files[0]; showBlob(pendingFile); } });
      body.append(eyebrow('PHOTO, OPTIONAL'), h('h2', { class: 'question', text: 'Add a photo for this week?' }),
        h('p', { class: 'lede', text: p.photoHint + '. It stays on this device.' }),
        preview, file, h('label', { class: 'btn btn-outline', for: 'photo-in', text: pendingFile || answer.photoId ? 'Change photo' : 'Add a photo' }));
    } else if (key === 'redflag') {
      body.append(eyebrow('ONE LAST QUESTION'), h('h2', { class: 'question', text: p.redFlag }),
        h('div', { class: 'yesno', role: 'radiogroup' },
          ['No', 'Yes'].map(label => {
            const val = label === 'Yes';
            const b = h('button', { class: 'yn' + (answer.redFlag === val ? ' is-on' : ''), type: 'button', role: 'radio', 'aria-checked': answer.redFlag === val ? 'true' : 'false', text: label });
            b.addEventListener('click', () => { answer.redFlag = val; draw(); });
            return b;
          })));
    }
    back.style.visibility = i === 0 ? 'hidden' : 'visible';
    const last = i === steps.length - 1;
    next.textContent = last ? 'Save check-in' : key === 'photo' && !pendingFile && !answer.photoId ? 'Skip' : 'Next';
    next.disabled = !ready(key);
  }

  next.addEventListener('click', async () => {
    if (!ready(steps[i])) return;
    if (i < steps.length - 1) { i++; draw(); window.scrollTo(0, 0); return; }
    next.disabled = true;
    next.textContent = 'Saving';
    if (pendingFile) {
      try { answer.photoId = await photos.savePhoto(pendingFile, productId, week); }
      catch (e) { err.textContent = 'We couldn\'t save the photo on this device. Your ratings are still saved.'; }
    }
    answer.date = eng.isoDate(eng.today());
    if (week === 0) { answer.doses = null; answer.redFlag = false; }
    const saved = store.saveCheckin(answer);
    if (!saved) { err.textContent = 'This device is out of storage space, so the check-in couldn\'t be saved.'; next.disabled = false; next.textContent = 'Try again'; return; }
    if (week === 0) {
      const nextBase = saved.tracked.find(x => !store.getCheckin(saved, x.productId, 0));
      ctx.go(nextBase ? `#/checkin/${nextBase.productId}/0` : '#/timeline');
      return;
    }
    const rule = eng.checkRules(p, store.checkinsFor(saved, productId));
    ctx.go(rule.consult ? `#/consult/${productId}/${week}` : `#/done/${productId}/${week}`);
  });
  back.addEventListener('click', () => { if (i > 0) { i--; draw(); } });

  const head = week === 0
    ? [eyebrow(`${p.short.toUpperCase()} · YOUR STARTING POINT`), h('h1', { class: 'title', text: 'Week 0: how are things today?' }), h('p', { class: 'lede', text: 'Rate how things are now. Every later week is compared with this.' })]
    : [eyebrow(`${p.short.toUpperCase()} · WEEK ${week} CHECK-IN`), h('h1', { class: 'title', text: `Week ${week}` }),
      week > cur ? h('p', { class: 'note', text: `You're in week ${cur}. This is week ${week}'s check-in.` }) : null,
      existing ? h('p', { class: 'note', text: 'You already checked in for this week. Saving replaces it.' }) : null];
  draw();
  view.append(h('section', { class: 'screen checkin' },
    ...head, dots, body, err,
    h('div', { class: 'sticky-actions split' }, back, next)));
}

function scale(sign, value, onPick) {
  return h('div', { class: 'scale' },
    h('div', { class: 'scale-track', role: 'radiogroup', 'aria-label': sign.label },
      sign.anchors.map((word, k) => {
        const v = k + 1;
        const b = h('button', { class: 'scale-step' + (value === v ? ' is-on' : '') + (value && v < value ? ' is-before' : ''), type: 'button', role: 'radio', 'aria-checked': value === v ? 'true' : 'false', 'aria-label': word });
        b.addEventListener('click', () => onPick(v));
        return b;
      })),
    h('div', { class: 'scale-words' }, sign.anchors.map((word, k) => h('span', { class: value === k + 1 ? 'is-on' : '', text: word }))),
    h('p', { class: 'scale-chosen', 'aria-live': 'polite', text: value ? sign.anchors[value - 1] : 'Tap a point on the scale' }));
}

/* ---------- 5. Timeline ---------- */
export function timeline(view, productId) {
  const data = store.load();
  if (!data.tracked.length) { ctx.go('#/welcome'); return; }
  const t = data.tracked.find(x => x.productId === productId) || data.tracked[0];
  const p = P(t.productId);
  const missingBase = data.tracked.find(x => !store.getCheckin(data, x.productId, 0));
  const list = store.checkinsFor(data, p.id);
  const cur = eng.currentWeek(t.startDate);
  const rule = eng.checkRules(p, list);
  const expDate = p.expectedChangeWeek ? eng.formatDate(eng.weekEndDate(t.startDate, p.expectedChangeWeek)) : null;

  const facts = h('dl', { class: 'facts' },
    h('div', null, h('dt', { text: 'Product' }), h('dd', { text: p.name })),
    h('div', null, h('dt', { text: 'Concern' }), h('dd', { text: p.concern })),
    h('div', null, h('dt', { text: 'Results expected by' }), h('dd', { text: p.expectedChangeWeek ? `Week ${p.expectedChangeWeek}, around ${expDate}` : 'No timeline promised by Be Bodywise' })));

  const months = p.months.map(m => monthCard(p, t, list, m, cur));

  view.append(h('section', { class: 'screen wide' },
    tabs(data, p.id, 'timeline'),
    h('div', { class: 'timeline-head' },
      h('div', null,
        eyebrow(`YOU ARE IN WEEK ${cur} OF ${eng.TOTAL_WEEKS}`),
        h('h1', { class: 'title', text: p.short.charAt(0).toUpperCase() + p.short.slice(1) })),
      facts),
    missingBase ? h('div', { class: 'callout' }, h('p', { text: 'Set your starting point first, so later weeks have something to compare with.' }), h('a', { class: 'btn btn-primary', href: `#/checkin/${missingBase.productId}/0`, text: 'Rate Week 0' })) : null,
    rule.consult ? h('div', { class: 'callout callout-consult' }, h('p', { text: rule.reason }), h('a', { class: 'btn btn-outline-accent', href: `#/consult/${p.id}/${cur}`, text: 'See what to do' })) : null,
    homeScreenCard(data),
    p.note ? h('p', { class: 'note', text: p.note }) : null,
    h('div', { class: 'month-grid' }, months)));
}

function monthCard(p, t, list, m, cur) {
  const weeks = eng.weeksOfMonth(m.month);
  const label = m.month === 4 ? 'MONTH 4+ · LOOK-AHEAD' : `MONTH ${m.month} · WEEKS ${weeks[0]}–${weeks[weeks.length - 1]}`;
  const isNow = weeks.includes(cur);
  return h('article', { class: 'month-card' + (isNow ? ' is-now' : '') + (m.month === 4 ? ' is-ahead' : '') },
    h('a', { class: 'month-link', href: m.month === 4 ? null : `#/month/${p.id}/${m.month}` },
      eyebrow(label),
      h('p', { class: 'claim-type type-' + m.type, text: TYPE_LABEL[m.type] }),
      h('p', { class: 'claim' + (m.type === 'brand' ? '' : ' is-app'), text: m.text }),
      m.type === 'brand' ? h('p', { class: 'source', text: 'Source: Be Bodywise product page' }) : null),
    weeks.length ? h('div', { class: 'chips' }, weeks.map(w => weekChip(p, list, w, cur))) : null);
}

function weekChip(p, list, w, cur) {
  const done = list.some(c => c.week === w);
  const cls = ['chip'];
  if (done) cls.push('is-done');
  else if (w === cur) cls.push('is-current');
  else if (w < cur) cls.push('is-missed');
  if (w === p.expectedChangeWeek) cls.push('is-milestone');
  const href = done ? `#/month/${p.id}/${eng.monthOfWeek(w)}` : `#/checkin/${p.id}/${w}`;
  const state = done ? 'done' : w === cur ? 'due now' : w < cur ? 'missed' : 'upcoming';
  return h('a', { class: cls.join(' '), href, 'aria-label': `Week ${w}, ${state}` }, h('span', { text: `W${w}` }));
}

function homeScreenCard(data) {
  if (data.profile.homeScreenDismissed || isStandalone() || store.isDemo()) return null;
  if (!data.checkins.some(c => c.week === 0)) return null;
  const ios = /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
  const card = h('div', { class: 'callout' },
    h('p', { class: 'callout-title', text: 'Keep your history safe' }),
    h('p', { text: ios ? 'On iPhone, Safari can clear saved data after 7 days without a visit. Tap Share, then Add to Home Screen, to keep it.' : 'Add Steady to your home screen from the browser menu (Add to Home screen or Install app) so it opens like an app.' }),
    h('button', { class: 'btn btn-quiet', type: 'button', text: 'Got it', onclick: () => { const d = store.load(); d.profile.homeScreenDismissed = true; store.save(d); card.remove(); } }));
  return card;
}

/* ---------- 6. Month detail ---------- */
export function month(view, productId, mStr) {
  const data = store.load();
  const t = data.tracked.find(x => x.productId === productId);
  const p = P(productId);
  if (!p || !t) { ctx.go('#/timeline'); return; }
  const m = p.months.find(x => x.month === parseInt(mStr, 10)) || p.months[0];
  const list = store.checkinsFor(data, p.id);
  const cur = eng.currentWeek(t.startDate);
  const weeks = eng.weeksOfMonth(m.month);
  view.append(h('section', { class: 'screen' },
    eyebrow(`MONTH ${m.month} · WHAT TO EXPECT`),
    h('p', { class: 'claim-type type-' + m.type, text: TYPE_LABEL[m.type] }),
    h('h1', { class: 'display claim-big' + (m.type === 'brand' ? '' : ' is-app'), text: m.text }),
    m.type === 'brand' ? h('p', { class: 'source' }, 'Source: ', h('a', { href: p.source, target: '_blank', rel: 'noopener noreferrer', text: 'Be Bodywise product page' })) : null,
    h('div', { class: 'week-list' }, weeks.map(w => {
      const c = list.find(x => x.week === w);
      return h('div', { class: 'week-row' + (w === p.expectedChangeWeek ? ' is-milestone' : '') },
        h('div', { class: 'week-row-head' },
          h('p', { class: 'week-name', text: `Week ${w}` + (w === cur ? ' · this week' : '') + (w === p.expectedChangeWeek ? ' · expected change' : '') }),
          h('a', { class: 'btn btn-small ' + (c ? 'btn-quiet' : 'btn-outline'), href: `#/checkin/${p.id}/${w}`, text: c ? 'Redo' : 'Check in' })),
        c ? h('dl', { class: 'ratings' }, p.signs.map(sg => h('div', null, h('dt', { text: sg.label }), h('dd', { text: sg.anchors[(c.ratings[sg.id] || 1) - 1] }))),
          c.doses !== null && c.doses !== undefined ? h('div', null, h('dt', { text: 'Days used' }), h('dd', { text: `${c.doses} of 7` })) : null)
          : h('p', { class: 'fine', text: w > cur ? 'Upcoming' : 'Not checked in yet' }));
    }))));
}

/* ---------- 8. Check-in done ---------- */
export function done(view, productId, weekStr) {
  const data = store.load();
  const p = P(productId);
  const week = parseInt(weekStr, 10);
  if (!p) { ctx.go('#/timeline'); return; }
  const list = store.checkinsFor(data, productId);
  const status = eng.statusLine(p, list, week);
  const t = data.tracked.find(x => x.productId === productId);
  const nextDue = week < eng.TOTAL_WEEKS && t ? eng.formatDate(eng.weekEndDate(t.startDate, week + 1)) : null;
  const others = data.tracked.filter(x => x.productId !== productId && !store.getCheckin(data, x.productId, eng.currentWeek(x.startDate)));
  const nextP = others.length ? P(others[0].productId) : null;
  view.append(h('section', { class: 'screen done' },
    eyebrow(`WEEK ${week} DONE`),
    h('h1', { class: 'display', text: eng.summaryLine(p, list, week) }),
    h('p', { class: 'lede', text: status.text }),
    nextDue ? h('p', { class: 'fine', text: `Next check-in for your ${p.short.toLowerCase()}: ${nextDue}.` }) : h('p', { class: 'fine', text: 'That was your last weekly check-in.' }),
    miniTrend(p, list),
    h('div', { class: 'actions' },
      nextP ? h('a', { class: 'btn btn-primary', href: `#/checkin/${nextP.id}/${eng.currentWeek(others[0].startDate)}`, text: `Next: ${nextP.short} check-in` }) : null,
      h('a', { class: nextP ? 'btn btn-outline' : 'btn btn-primary', href: `#/timeline/${p.id}`, text: 'Back to timeline' }),
      h('a', { class: 'btn btn-quiet', href: `#/progress/${p.id}`, text: 'See progress' }))));
}

function miniTrend(p, list) {
  const sg = p.signs.find(x => x.id === p.mainSign);
  return h('div', { class: 'chart-card' }, h('p', { class: 'chart-title', text: sg.label }), chart(p, sg, list, true));
}

/* ---------- 9. Progress ---------- */
export function progress(view, productId) {
  const data = store.load();
  if (!data.tracked.length) { ctx.go('#/welcome'); return; }
  const t = data.tracked.find(x => x.productId === productId) || data.tracked[0];
  const p = P(t.productId);
  const list = store.checkinsFor(data, p.id);
  const withPhotos = list.filter(c => c.photoId);
  const strip = h('div', { class: 'photo-strip' });
  withPhotos.forEach(c => {
    const cell = h('figure', { class: 'photo-cell' }, h('div', { class: 'skeleton skeleton-photo' }), h('figcaption', { text: `Week ${c.week}` }));
    strip.append(cell);
    photos.getPhoto(c.photoId).then(b => {
      if (b) cell.firstChild.replaceWith(h('img', { src: URL.createObjectURL(b), alt: `Week ${c.week} photo`, loading: 'lazy' }));
      else cell.remove();
    });
  });
  view.append(h('section', { class: 'screen wide' },
    tabs(data, p.id, 'progress'),
    eyebrow('PROGRESS'),
    h('h1', { class: 'title', text: p.short.charAt(0).toUpperCase() + p.short.slice(1) }),
    h('p', { class: 'lede', text: 'Each line is one sign, from your starting point to now. Higher is better.' }),
    list.length ? h('div', { class: 'chart-grid' }, p.signs.map(sg => h('div', { class: 'chart-card' }, h('p', { class: 'chart-title', text: sg.label }), chart(p, sg, list, false)))) :
      h('p', { class: 'note', text: 'Your charts appear after your first check-in.' }),
    withPhotos.length ? [eyebrow('YOUR PHOTOS'), strip] : null));
}

function chart(p, sg, list, compact) {
  const W = 320, H = compact ? 120 : 150, L = 14, R = 14, T = 10, B = 22;
  const x = w => L + (w / eng.TOTAL_WEEKS) * (W - L - R);
  const y = v => T + (5 - v) / 4 * (H - T - B);
  const pts = eng.trend(list, sg.id);
  const kids = [];
  if (p.expectedChangeWeek) kids.push(s('rect', { x: x(p.expectedChangeWeek) - 6, y: T - 4, width: 12, height: H - T - B + 8, class: 'chart-band' }));
  [1, 3, 5].forEach(v => kids.push(s('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), class: 'chart-grid' })));
  [0, 4, 8, 13].forEach(w => kids.push(s('text', { x: x(w), y: H - 6, 'text-anchor': w === 0 ? 'start' : w === 13 ? 'end' : 'middle', class: 'chart-axis' }, w === 0 ? 'Start' : `W${w}`)));
  if (pts.length > 1) kids.push(s('polyline', { points: pts.map(pt => `${x(pt.week)},${y(pt.value)}`).join(' '), class: 'chart-line' }));
  pts.forEach(pt => kids.push(s('circle', { cx: x(pt.week), cy: y(pt.value), r: 3.5, class: 'chart-dot' })));
  const last = pts[pts.length - 1];
  const label = last ? `${sg.label}: now "${sg.anchors[last.value - 1]}"` : sg.label;
  return h('div', { class: 'chart' },
    s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': label }, kids),
    h('p', { class: 'chart-scale', text: `Top: ${sg.anchors[4]} · Bottom: ${sg.anchors[0]}` }),
    last ? h('p', { class: 'fine', text: `Now: ${sg.anchors[last.value - 1]}` }) : null);
}

/* ---------- 10. Consult a doctor ---------- */
export function consult(view, productId) {
  const data = store.load();
  const p = P(productId);
  if (!p) { ctx.go('#/timeline'); return; }
  const rule = eng.checkRules(p, store.checkinsFor(data, productId));
  view.append(h('section', { class: 'screen' },
    h('div', { class: 'consult-card' },
      eyebrow(p.short.toUpperCase()),
      h('h1', { class: 'title', text: 'It\'s worth checking with a doctor' }),
      h('p', { class: 'lede', text: rule.reason || 'Something in your recent check-ins is worth a doctor\'s view.' }),
      h('p', { text: 'Be Bodywise has dermatologists and trichologists you can consult in its app. Your check-in is saved.' }),
      h('div', { class: 'actions' },
        h('a', { class: 'btn btn-accent', href: consultLink(), target: '_blank', rel: 'noopener noreferrer', text: 'Consult a doctor' }),
        h('a', { class: 'btn btn-quiet', href: `#/timeline/${p.id}`, text: 'Back to timeline' })),
      h('p', { class: 'fine', text: 'Concept. Not medical advice. Thresholds not clinically reviewed. If symptoms are severe, contact a doctor or emergency services directly.' }))));
}

/* ---------- 11. Settings ---------- */
export function settings(view) {
  const data = store.load();
  const time = h('input', { type: 'time', class: 'field', value: data.profile.reminderTime || '21:00', id: 'remind-s' });
  const msg = h('p', { class: 'fine', 'aria-live': 'polite' });
  const ics = () => {
    const d = store.load();
    d.profile.reminderTime = time.value || '21:00';
    store.save(d);
    cal.download(cal.buildIcs(ctx.products, d.tracked, d.profile.reminderTime));
    msg.textContent = 'Downloaded. Open the file to add the reminders. On Android, choose your Calendar app if asked.';
  };
  let confirmDelete = false;
  const delBtn = h('button', { class: 'btn btn-danger', type: 'button', text: 'Delete all my data' });
  delBtn.addEventListener('click', async () => {
    if (!confirmDelete) { confirmDelete = true; delBtn.textContent = 'Tap again to delete everything'; return; }
    store.deleteAll();
    await photos.deleteAllPhotos();
    ctx.refresh('#/welcome');
  });
  view.append(h('section', { class: 'screen' },
    eyebrow('SETTINGS'),
    h('h1', { class: 'title', text: 'Reminders and your data' }),
    h('div', { class: 'settings-group' },
      h('h2', { class: 'subtitle', text: 'Reminders' }),
      h('div', { class: 'date-row' }, icon('calendar', 'icon'), h('label', { class: 'date-label', for: 'remind-s' }, h('span', { class: 'product-name', text: 'Daily reminder time' })), time),
      h('button', { class: 'btn btn-primary', type: 'button', text: 'Add to calendar', onclick: ics, disabled: data.tracked.length ? null : true }),
      msg),
    h('div', { class: 'settings-group' },
      h('h2', { class: 'subtitle', text: 'Your products' }),
      data.tracked.length ? data.tracked.map(t => {
        const p = P(t.productId);
        let armed = false;
        const rm = h('button', { class: 'btn btn-small btn-quiet', type: 'button', text: 'Remove' });
        rm.addEventListener('click', async () => {
          if (!armed) { armed = true; rm.textContent = 'Tap again: removes its check-ins'; return; }
          const ids = store.removeProduct(t.productId);
          await photos.deletePhotos(ids);
          ctx.refresh('#/settings');
        });
        return h('div', { class: 'date-row' }, icon(p.icon, 'icon'), h('div', { class: 'date-label' }, h('span', { class: 'product-name', text: p.name }), h('span', { class: 'fine', text: `Started ${eng.formatDate(eng.parseDate(t.startDate))}` })), rm);
      }) : h('p', { class: 'fine', text: 'No products yet.' }),
      data.tracked.length < MAX_PRODUCTS ? h('a', { class: 'btn btn-outline', href: '#/pick', text: 'Add or change products' }) : null),
    h('div', { class: 'settings-group' },
      h('h2', { class: 'subtitle', text: 'Your data' }),
      h('p', { text: 'Everything you enter stays in this browser on this device. Nothing is uploaded, and there is no account.' }),
      store.isDemo() ? h('button', { class: 'btn btn-outline', type: 'button', text: 'Leave sample data', onclick: () => { demo.clear(); ctx.refresh('#/'); } })
        : h('button', { class: 'btn btn-outline', type: 'button', text: 'Preview with sample data', onclick: () => { demo.fill(8); ctx.refresh('#/timeline'); } }),
      delBtn,
      h('p', { class: 'fine' }, h('a', { href: 'terms.html', text: 'Terms of Service' }), ' · ', h('a', { href: 'privacy.html', text: 'Privacy Policy' })))));
}
