// Small DOM helpers. Text is always set as text, never parsed as HTML.
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else el.setAttribute(k, v === true ? '' : v);
    }
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

const SVG_NS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined) el.setAttribute(k, v);
  for (const c of children.flat()) {
    if (c === null || c === undefined) continue;
    el.appendChild(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// Custom line marks drawn for Steady (24 x 24, 1.5 stroke).
const ICONS = {
  serum: ['M9 3h6', 'M10 3v3h4V3', 'M8 6h8v13a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z', 'M10.5 11h3'],
  gummy: ['M7 8a5 5 0 0 1 10 0v7a5 5 0 0 1-10 0z', 'M9.5 9.5h.01', 'M14.5 9.5h.01', 'M10 14c1.2 1 2.8 1 4 0'],
  wash: ['M11 2h4', 'M13 2v3', 'M10 5h6v3H10z', 'M8 8h10v11a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2z', 'M5 7h.01', 'M4 11h.01'],
  lotion: ['M8 3h8l-1 4H9z', 'M7 7h10l-1 12a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z', 'M10 12h4'],
  rollon: ['M9 8a3 3 0 0 1 6 0', 'M8 8h8v11a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z', 'M12 2.5a2.5 2.5 0 1 1 0 5'],
  calendar: ['M4 6h16v14H4z', 'M4 10h16', 'M8 3v5', 'M16 3v5'],
  hair: ['M5 20c0-6 2-12 7-16', 'M10 20c0-5 1.5-10 6-14', 'M15 20c0-3 1-6 4-9'],
  drop: ['M12 3c3 4 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 3-7 6-11z'],
  eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z', 'M12 9.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z'],
  addhome: ['M7 2.5h10v19H7z', 'M10.5 18.5h3', 'M12 7.5v6', 'M9 10.5h6']
};

export function icon(name, cls = 'icon') {
  const paths = ICONS[name] || ICONS.drop;
  return s('svg', { class: cls, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' },
    paths.map(d => s('path', { d })));
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
