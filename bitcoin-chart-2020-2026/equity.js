// Exchange-session policy for equities. Calendar slots are retained for the film clock;
// closed slots carry the last close for camera/HUD only and NEVER become candles.
const fs = require('fs');
const path = require('path');
const DAY = 86400000;
function readSessions(dir) {
  const rows = fs.readFileSync(path.join(dir, 'sessions.csv'), 'utf8').trim().split(/\r?\n/).slice(1);
  return new Map(rows.map((line) => { const [date, openUTC, closeUTC] = line.split(','); return [date, { date, openUTC, closeUTC }]; }));
}
function slot(real, sessions, date) {
  if (sessions.has(date)) {
    const value = real.get(date);
    if (!value) throw new Error(`Missing equity trading session ${date}; never interpolate an open session`);
    const [o, h, l, c] = value;
    if (value.some((v) => !Number.isFinite(v) || v <= 0) || h < Math.max(o, c) || l > Math.min(o, c) || l > h)
      throw new Error(`Invalid equity OHLC ${date}`);
    return { value, source: 1, trading: 1 };
  }
  if (real.has(date)) throw new Error(`Equity price on a closed exchange date: ${date}`);
  const previous = [...real.keys()].filter((d) => d < date).sort().at(-1);
  if (!previous) throw new Error(`No earlier close for ${date}`);
  const close = real.get(previous)[3];
  return { value: [close, close, close, close], source: 0, trading: 0 };
}
function anchorEvent(event, detail, sessions) {
  const dates = [...sessions.keys()].sort();
  let date = event.date, timing = detail?.marketTiming || 'unknown';
  if (detail?.publishedAt) {
    const t = Date.parse(detail.publishedAt), session = sessions.get(date);
    if (!Number.isFinite(t)) throw new Error(`Invalid publishedAt: ${event.text}`);
    if (session) timing = t >= Date.parse(session.closeUTC) ? 'after-close' : t < Date.parse(session.openUTC) ? 'before-open' : 'during-session';
  }
  const anchorDate = dates.find((d) => timing === 'after-close' ? d > date : d >= date);
  return { ...event, anchorDate: anchorDate || null, marketTiming: timing,
    ...(detail?.publishedAt ? { publishedAt: detail.publishedAt } : {}) };
}
function lowName(days, day) {
  const lowest = Math.min(...days.slice(0, day + 1).map((r) => r[2]));
  return days[day][2] <= lowest + 1e-9 ? 'ALL-TIME LOW' : 'CYCLE LOW';
}
function reviewState(dir) {
  const crypto = require('crypto'), h = crypto.createHash('sha256');
  for (const file of ['events.csv', 'event-sources.csv', 'event-details.json']) h.update(fs.readFileSync(path.join(dir, file)));
  const eventHash = h.digest('hex'), file = path.join(dir, 'review-state.json');
  const saved = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : {};
  return { ...saved, eventHash, status: saved.status === 'approved' && saved.eventHash === eventHash ? 'approved' : 'pending' };
}
module.exports = { readSessions, slot, anchorEvent, lowName, reviewState };
