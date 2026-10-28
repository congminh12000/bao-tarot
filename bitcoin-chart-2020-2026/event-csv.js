// Stored research includes removed rows. Only make-data.js applies video visibility rules.
// Current schema: # date,kind,hit,tag,text,remove. Legacy five-column files default to false.
const fs = require('fs');

function fields(line) {
  const out = [];
  let value = '', quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (quoted && line[i + 1] === '"') { value += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { out.push(value); value = ''; }
    else value += c;
  }
  if (quoted) throw new Error('unclosed CSV quote');
  out.push(value);
  return out;
}

function parseEvents(text, source = 'events.csv') {
  const lines = text.split(/\r?\n/);
  const header = lines.find((line) => /^#\s*date\s*,\s*kind\s*,\s*hit\s*,\s*tag\s*,\s*text(?:\s*,\s*remove)?\s*$/.test(line));
  const withRemove = header && header.split(',').at(-1).trim() === 'remove';
  return lines.flatMap((line, index) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return [];
    try {
      const p = fields(line);
      let remove = false;
      if (withRemove) {
        const flag = p.at(-1).trim().toLowerCase();
        if (p.length < 6 || !['true', 'false'].includes(flag)) throw new Error('remove must be true or false');
        remove = flag === 'true';
        p.pop();
      }
      if (p.length < 5) throw new Error('expected date,kind,hit,tag,text');
      const tag = p[3].trim();
      return [{ date: p[0].trim(), kind: p[1].trim(), hit: +p[2], ...(tag ? { tag } : {}), text: p.slice(4).join(',').trim(), remove }];
    } catch (error) { throw new Error(`${source}:${index + 1}: ${error.message}`); }
  });
}

const readEvents = (file) => parseEvents(fs.readFileSync(file, 'utf8'), file);
module.exports = { parseEvents, readEvents };
