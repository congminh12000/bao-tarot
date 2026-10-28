// Compare legacy song audio bit-for-bit against the pre-Coin-Trail revision.
// Uses isolated short fixtures; never touches the film's data, music, or frames.
const fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');
const { execFileSync } = require('child_process');
const assert = require('node:assert/strict');
const ROOT = path.resolve(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'trail-regression-'));
const baseline = execFileSync('git', ['show', '907574fa:bitcoin-chart-2020-2026/song.js'], { cwd: ROOT });
try {
  fs.cpSync(path.join(ROOT, 'engine'), path.join(temp, 'engine'), { recursive: true });
  fs.mkdirSync(path.join(temp, 'data')); fs.copyFileSync(path.join(ROOT, 'data/music.js'), path.join(temp, 'data/music.js'));
  fs.copyFileSync(path.join(ROOT, 'score.js'), path.join(temp, 'score.js'));
  const results = [];
  for (const legacyShort of [false, true]) {
    const btc = { start: '2021-01-01', pre: 0, days: Array.from({ length: 10 }, (_, i) => [100 + i, 102 + i, 99 + i, 101 + i]), real: '1111111111',
      phases: [{ start: '2021-01-01', end: '2021-01-10', type: 'uptrend', cue: 'up-vanguard' }],
      short: legacyShort ? { n: 1, type: 'uptrend', cue: 'up-vanguard', startTurn: false, endTurn: false } : null,
      events: [{ date: '2021-01-05', kind: 'up', hit: 2, text: 'TEST' }] };
    fs.writeFileSync(path.join(temp, 'btc-data.js'), 'module.exports=' + JSON.stringify(btc));
    const hashes = [];
    for (const version of [baseline, fs.readFileSync(path.join(ROOT, 'song.js'))]) {
      fs.writeFileSync(path.join(temp, 'song.js'), version);
      execFileSync(process.execPath, ['song.js'], { cwd: temp, env: { ...process.env, STEMS: '', PREVIEW_CUE: '', SHORT_STYLE: '' }, stdio: 'pipe' });
      hashes.push(crypto.createHash('sha256').update(fs.readFileSync(path.join(temp, 'out/music.wav'))).digest('hex'));
    }
    assert.equal(hashes[0], hashes[1], 'Legacy audio must be bit-identical');
    results.push({ mode: legacyShort ? 'legacy-candle-short' : 'long', wavSha256: hashes[0], identical: true });
    console.log(`PASS legacy ${results.at(-1).mode}: identical WAV SHA256 ${hashes[0]}`);
  }
  fs.mkdirSync(path.join(ROOT, 'out/coin-trail'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'out/coin-trail/legacy-audio-regression.json'), JSON.stringify(results, null, 2) + '\n');
} finally { fs.rmSync(temp, { recursive: true, force: true }); }
