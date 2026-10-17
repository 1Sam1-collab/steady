// Fills and clears labelled sample check-ins, stored apart from real data.
import { isoDate, today } from './engine.js';
import { saveDemo, setDemo } from './store.js';

// Sample paths, 1 = worst, 5 = best, indexed by week 0..13.
const PATHS = {
  'hair-serum': {
    hairfall: [2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4],
    parting:  [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4],
    scalp:    [5, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
  },
  'body-wash': {
    patches: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4],
    texture: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5],
    comfort: [5, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]
  },
  'multivitamin': {
    tired:   [3, 3, 3, 3, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3],
    illness: [4, 4, 4, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    stress:  [3, 3, 3, 3, 3, 2, 3, 3, 3, 3, 3, 4, 4, 4]
  }
};
const DOSES = [7, 6, 7, 5, 6, 7, 7, 6, 7, 7, 6, 7, 7, 7];

export function fill(week) {
  const w = Math.max(1, Math.min(13, week));
  const start = new Date(today().getTime() - (w - 1) * 7 * 86400000 - 6 * 86400000);
  const startIso = isoDate(start);
  const data = {
    version: 1,
    profile: { reminderTime: '21:00', createdAt: new Date().toISOString(), homeScreenDismissed: true, privacyNoted: true },
    tracked: Object.keys(PATHS).map(productId => ({ productId, startDate: startIso })),
    checkins: []
  };
  Object.entries(PATHS).forEach(([productId, signs]) => {
    for (let k = 0; k <= w; k++) {
      const ratings = {};
      Object.entries(signs).forEach(([s, arr]) => { ratings[s] = arr[k]; });
      data.checkins.push({
        productId,
        week: k,
        date: isoDate(new Date(start.getTime() + k * 7 * 86400000)),
        doses: k === 0 ? null : DOSES[k],
        ratings,
        redFlag: false,
        photoId: null,
        sample: true
      });
    }
  });
  setDemo(true);
  saveDemo(data);
}

export function clear() {
  setDemo(false);
}
