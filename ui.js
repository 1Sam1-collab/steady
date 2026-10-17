// Pop-ups (sheets) and toasts, built in the page. No browser dialogs.
import { h } from './dom.js';

let open = null;

export function closeModal() {
  if (!open) return;
  const { overlay, prev } = open;
  overlay.classList.add('is-leaving');
  setTimeout(() => overlay.remove(), 220);
  document.removeEventListener('keydown', onKey);
  open = null;
  if (prev && prev.focus) prev.focus({ preventScroll: true });
}

function onKey(e) {
  if (e.key === 'Escape') closeModal();
}

// showModal({ eyebrow, title, body: [nodes], actions: [nodes], onClose })
export function showModal({ eyebrow, title, body = [], actions = [] }) {
  closeModal();
  const titleId = 'sheet-title-' + Date.now();
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    h('span', { class: 'sheet-handle', 'aria-hidden': 'true' }),
    eyebrow ? h('p', { class: 'eyebrow', text: eyebrow }) : null,
    h('h2', { class: 'sheet-title', id: titleId, text: title }),
    h('div', { class: 'sheet-body' }, body),
    actions.length ? h('div', { class: 'sheet-actions' }, actions) : null);
  const overlay = h('div', { class: 'sheet-overlay' }, sheet);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.body.appendChild(overlay);
  open = { overlay, prev: document.activeElement };
  document.addEventListener('keydown', onKey);
  const first = sheet.querySelector('a, button');
  if (first) setTimeout(() => first.focus({ preventScroll: true }), 50);
  return sheet;
}

let toastTimer = null;
export function toast(title, text) {
  let el = document.getElementById('toast');
  if (!el) {
    el = h('div', { id: 'toast', class: 'toast', role: 'status', 'aria-live': 'polite' });
    document.body.appendChild(el);
  }
  el.replaceChildren(h('span', { class: 'toast-dot', 'aria-hidden': 'true' }), h('div', null, h('p', { class: 'toast-title', text: title }), text ? h('p', { class: 'toast-text', text }) : null));
  el.classList.remove('is-on');
  void el.offsetWidth;
  el.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-on'), 4200);
}
