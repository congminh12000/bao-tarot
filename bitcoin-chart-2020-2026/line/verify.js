// Post-render QA for Coin Trail. Uses collision times, isolated SFX and AAC/reference
// correlation instead of the long film's strongest-flash detector. Does not render frames.
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const assert = require('node:assert/strict');
const [folder, video] = process.argv.slice(2);
if (!folder || !video) throw new Error('usage: node line/verify.js <part-workspace> <mp4> (STEMS=1 node song.js first)');
const dir = path.resolve(folder), file = path.resolve(video), part = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json')));
const probe = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', file]));
const v = probe.streams.find((s) => s.codec_type === 'video'), a = probe.streams.find((s) => s.codec_type === 'audio');
assert.ok(v && a, 'Both video and audio required');
assert.equal(v.avg_frame_rate, '60/1'); assert.ok(Math.abs(v.width / v.height - 9 / 16) < .003);
assert.equal(+v.nb_read_frames, Math.round(part.duration * 60));
assert.ok(Math.abs(+probe.format.duration - part.duration) < .06);
const frames = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_frames',
  '-show_entries', 'frame=best_effort_timestamp_time', '-of', 'json', file], { maxBuffer: 20e6 })).frames;
frames.forEach((f, i) => assert.ok(Math.abs(+f.best_effort_timestamp_time - i / 60) < .0001, 'Non-continuous frame PTS'));

const decode = (f, t, len) => {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-ss', String(Math.max(0, t)), '-i', f, '-t', String(len), '-vn', '-ar', '8000', '-ac', '1', '-f', 'f32le', '-'], { maxBuffer: 20e6 });
  return Float32Array.from({ length: b.length / 4 }, (_, i) => b.readFloatLE(i * 4));
};
const wav = path.join(dir, 'out/music.wav'), stem = path.join(dir, 'out/stem-hFx.wav');
assert.ok(fs.existsSync(wav) && fs.existsSync(stem), 'Generate master and SFX stems with STEMS=1 node song.js');
const measures = [];
for (const e of part.events) {
  const start = Math.max(0, e.t - .05), ref = decode(wav, start, .24), encoded = decode(file, start - .04, .32);
  let best = { correlation: -1, lagMs: null };
  for (let lag = 0; lag <= 640; lag++) {
    let xy = 0, xx = 0, yy = 0;
    for (let i = 0; i < ref.length && i + lag < encoded.length; i++) { const x = ref[i], y = encoded[i + lag]; xy += x * y; xx += x * x; yy += y * y; }
    const correlation = xy / Math.sqrt(xx * yy + 1e-30);
    if (correlation > best.correlation) best = { correlation, lagMs: (lag - 320) / 8 };
  }
  const hit = decode(stem, e.t, .1), peak = Math.max(...hit.map(Math.abs));
  assert.ok(peak > 1e-7, `Silent bubble SFX: ${e.id}`);
  assert.ok(best.correlation > .9 && Math.abs(best.lagMs) <= 1000 / 60, `AAC sync failed at ${e.id}: ${JSON.stringify(best)}`);
  measures.push({ id: e.id, contact: e.t, sfxPeak: peak, ...best });
}
// ffmpeg prints EBU results on stderr; use spawnSync to retain the report separately.
const result = require('child_process').spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8' });
assert.equal(result.status, 0);
fs.writeFileSync(path.join(dir, 'out/aac-loudness.txt'), result.stderr);
const integrated = [...result.stderr.matchAll(/I:\s*(-?[\d.]+) LUFS/g)].at(-1), truePeak = [...result.stderr.matchAll(/Peak:\s*(-?[\d.]+) dBFS/g)].at(-1);
assert.ok(integrated && Math.abs(+integrated[1] + 16) <= .4, 'AAC loudness outside -16 ±0.4 LUFS');
assert.ok(truePeak && +truePeak[1] <= -1, 'AAC true peak exceeds -1 dBTP');
const report = { duration: part.duration, frames: +v.nb_read_frames, measures, lufs: +integrated[1], truePeak: +truePeak[1],
  pictureQA: 'Required separately: inspect decoded before/contact/after frames, layout and motion; this tool does not claim pixel collision verification.' };
fs.writeFileSync(path.join(dir, 'out/collision-qa.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
