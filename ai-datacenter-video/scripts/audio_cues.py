"""Writes the <audio> elements into index.html between the AUDIO markers.
Each cue: (id, file, picture time, peak offset in file, volume, media-start, duration or None).
The clip starts so its peak lands one frame after the picture."""
import re, subprocess
F = 1 / 30
CUES = [
  ("sx-type1", "typing.mp3", 0.0, 0.0, 0.45, 0.4, 1.1),
  ("sx-push", "whoosh-short.mp3", 1.05, 0.162, 0.45, 0, None),
  ("sx-type2", "typing.mp3", 1.3, 0.0, 0.5, 0.4, 1.1),
  ("sx-enter", "click.mp3", 3.44, 0.073, 0.85, 0, None),
  ("sx-pullback", "whoosh.mp3", 3.62, 0.162, 0.3, 0, None),
  ("sx-lens", "pop.mp3", 4.32, 0.12, 0.45, 0, None),
  ("sx-bowl", "sparkle.mp3", 4.75, 0.027, 0.4, 0, None),
  ("sx-poof", "pop.mp3", 6.82, 0.12, 0.7, 0, None),
  ("sx-tiles", "sparkle.mp3", 7.15, 0.027, 0.45, 0, None),
  ("sx-outwin", "whoosh-cinematic.mp3", 8.75, 2.503, 0.4, 0, None),
  ("sx-cable", "whoosh-short.mp3", 9.75, 0.162, 0.35, 0, None),
  ("sx-landed", "impact-bass-1.mp3", 11.82, 0.073, 0.4, 0, None),
  ("sx-riser", "riser.mp3", 14.0, 3.472, 0.3, 0, None),
  ("sx-reveal", "impact-bass-2.mp3", 14.0, 1.986, 0.55, 0, None),
  ("sx-roof", "whoosh.mp3", 16.9, 0.162, 0.4, 0, None),
  ("sx-drop", "pop.mp3", 18.85, 0.12, 0.6, 0, None),
  ("sx-rack", "ping.mp3", 18.9, 0.324, 0.3, 0, None),
  ("sx-dive", "whoosh-short.mp3", 20.45, 0.162, 0.45, 0, None),
  *[(f"sx-tok{i}", "key-press.mp3", 22.72 + i * 0.06, 0.076, 0.35, 0, None) for i in range(6)],
  ("sx-pour", "whoosh-short.mp3", 23.8, 0.162, 0.3, 0, None),
  ("sx-wave1", "sparkle.mp3", 23.85, 0.027, 0.3, 0, None),
  ("sx-wave2", "sparkle.mp3", 25.1, 0.027, 0.25, 0, None),
  ("sx-all", "ping.mp3", 26.44, 0.324, 0.45, 0, None),
  ("sx-allhit", "impact-bass-1.mp3", 26.44, 0.073, 0.3, 0, None),
  ("sx-heat1", "sizzle.wav", 28.6, 1.039, 0.35, 0, None),
  ("sx-heat2", "sizzle.wav", 30.0, 1.039, 0.25, 0, None),
  ("sx-water", "water.wav", 30.62, 0.376, 0.45, 0, None),
  ("sx-hum", "hum.wav", 35.8, 2.25, 0.3, 0, None),
  ("sx-zap", "glitch-1.mp3", 34.1, 0.82, 0.15, 0, None),
  ("sx-inset", "pop.mp3", 34.95, 0.12, 0.45, 0, None),
  ("sx-egg", "sizzle.wav", 36.0, 1.039, 0.45, 0, None),
  ("sx-splash", "splash.wav", 36.33, 0.012, 0.6, 0, None),
  ("sx-whip", "whoosh.mp3", 37.42, 0.162, 0.4, 0, None),
  ("sx-dcdrop", "impact-bass-1.mp3", 38.1, 0.073, 0.5, 0, None),
  ("sx-bolts", "glitch-1.mp3", 39.65, 0.82, 0.2, 0, None),
  ("sx-citydrop", "impact-bass-1.mp3", 40.7, 0.073, 0.45, 0, None),
  ("sx-lights", "sparkle.mp3", 40.76, 0.027, 0.35, 0, None),
  ("sx-globe", "whoosh-cinematic.mp3", 42.25, 2.503, 0.3, 0, None),
  *[(f"sx-dot{i}", f, t, pk, 0.28, 0, None) for i, (f, t, pk) in enumerate([("pop.mp3", 43.55, 0.12), ("click-soft.mp3", 43.95, 0.073), ("pop.mp3", 44.4, 0.12), ("click-soft.mp3", 44.85, 0.073), ("pop.mp3", 45.3, 0.12)])],
  ("sx-zoomdot", "whoosh-short.mp3", 46.42, 0.162, 0.4, 0, None),
  ("sx-type3", "typing.mp3", 47.1, 0.0, 0.35, 0.4, 1.1),
  ("sx-send", "sparkle.mp3", 48.72, 0.027, 0.35, 0, None),
  ("sx-dcflash", "ping.mp3", 49.97, 0.324, 0.3, 0, None),
  ("sx-answer", "chime.mp3", 50.82, 0.418, 0.45, 0, 2.0),
]
def flen(f):
    return float(subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", f"assets/audio/sfx/{f}"], capture_output=True, text=True).stdout)
rows = []
lane_end = [0.0] * 8
for cid, f, t, pk, vol, ms, dur in CUES:
    dur = dur or round(flen(f) - ms, 3)
    st = round(max(0.0, t - pk + F), 3)
    extra = f' data-media-start="{ms}"' if ms else ""
    extra += f' data-duration="{dur}"'
    lane = next(i for i in range(8) if lane_end[i] <= st)  # first free Studio lane
    lane_end[lane] = st + dur
    rows.append(f'      <audio id="{cid}" class="clip" src="assets/audio/sfx/{f}" data-start="{st}"{extra} data-volume="{vol}" data-track-index="{5 + lane}"></audio>')
block = "\n".join(rows)
s = open("index.html").read()
s = re.sub(r"(<!-- AUDIO:SFX -->)(.*?)(<!-- /AUDIO:SFX -->)", lambda m: m.group(1) + "\n" + block + "\n      " + m.group(3), s, flags=re.S)
open("index.html", "w").write(s)
print(len(rows), "cues")
