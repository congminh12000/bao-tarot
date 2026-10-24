"""Soft music bed, synthesised locally (no network models are reachable from this machine).
80 BPM, D major, 4-bar loop Dadd9 | Bm7 | Gmaj7 | Asus4-A. Warm pad + sub from the start, a soft
mallet arpeggio enters at the data center reveal, thins out for the heat, returns with the water,
lifts an octave for the globe and resolves under the last line.
Usage: python3 scripts/music.py assets/audio/music-bed.wav"""
import sys, numpy as np, soundfile as sf
from scipy.signal import lfilter, butter

SR = 44100
DUR = 52.5
BEAT = 60 / 80
BAR = BEAT * 4
N = int(SR * DUR)
t_all = np.arange(N) / SR

def hz(m): return 440.0 * 2 ** ((m - 69) / 12)
# chord voicings (MIDI): pad notes, arpeggio notes, bass root
CHORDS = [
    ([50, 57, 64, 66, 69], [62, 66, 69, 73, 76, 73, 69, 66], 38),   # Dadd9
    ([47, 54, 62, 66, 69], [59, 62, 66, 69, 74, 69, 66, 62], 35),   # Bm7
    ([43, 50, 59, 62, 66], [55, 59, 62, 66, 71, 66, 62, 59], 31),   # Gmaj7
    ([45, 52, 62, 64, 69], [57, 62, 64, 69, 74, 69, 64, 61], 33),   # Asus4 -> A
]

def env_adsr(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na) ** 2
    if nr: e[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return e

def pad_note(f, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for det in (-0.004, 0.0, 0.0045):
        ff = f * (1 + det)
        for h in range(1, 7):
            s += np.sin(2 * np.pi * ff * h * t + h) * (1 / h) * (0.9 ** h)
    s *= 1 + 0.08 * np.sin(2 * np.pi * 0.23 * t)
    return s * env_adsr(n, 1.1, 1.4) / 9

def mallet(f, dur=1.2):
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.2)
    s += 0.35 * np.sin(2 * np.pi * f * 4.0 * t) * np.exp(-t * 14)
    s += 0.15 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 6)
    s[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return s

def add(buf, x, t0):
    i = int(t0 * SR)
    if i >= len(buf): return
    x = x[: len(buf) - i]
    buf[i: i + len(x)] += x

pad = np.zeros(N); arp = np.zeros(N); bass = np.zeros(N); bell = np.zeros(N)
nbars = int(np.ceil(DUR / BAR))
for b in range(nbars):
    t0 = b * BAR
    padv, arpv, root = CHORDS[b % 4]
    last = t0 + BAR >= 49.4
    d = (DUR - t0) if last else BAR + 1.2
    for m in padv:
        add(pad, pad_note(hz(m), d), t0)
    bn = int(d * SR); tb = np.arange(bn) / SR
    add(bass, np.sin(2 * np.pi * hz(root) * tb) * env_adsr(bn, 0.4, 1.0) * 0.5, t0)
    if last:
        break
    for k, m in enumerate(arpv):
        tt = t0 + k * BEAT / 2
        # sections: arpeggio in for the data center, out for the heat, back with the water
        if tt < 13.9 or 27.6 <= tt < 30.6 or tt >= 49.6:
            continue
        lift = 12 if 41.9 <= tt < 46.5 else 0
        vel = 0.55 + 0.25 * (k % 4 == 0) + 0.1 * np.sin(k)
        add(arp, mallet(hz(m + lift)) * vel, tt)
# a sparkle bell on the reveal moments
for tt, m in [(14.0, 81), (26.44, 86), (41.95, 81), (50.7, 86)]:
    add(bell, mallet(hz(m), 2.5) * 0.6, tt)
# heat: a low pulse under the pad
pulse = np.zeros(N)
for k in range(8):
    tt = 27.6 + k * BEAT / 2
    n = int(0.6 * SR); tp = np.arange(n) / SR
    add(pulse, np.sin(2 * np.pi * hz(38) * tp) * np.exp(-tp * 6) * 0.6, tt)

# section dynamics
def curve(pts):
    xs, ys = zip(*pts)
    return np.interp(t_all, xs, ys)
padg = curve([(0, 0.0), (1.2, 0.55), (13.5, 0.6), (14.2, 0.85), (27.6, 0.8), (28.0, 0.55), (30.6, 0.85), (49.5, 0.85), (52.5, 0.0)])
arpg = curve([(0, 0.4), (41.8, 0.42), (42.0, 0.5), (46.5, 0.5), (46.8, 0.4), (52.5, 0.4)])
mix = pad * padg + arp * arpg * 0.42 + bass * padg * 0.5 + bell * 0.35 + pulse * 0.5

# gentle lowpass to keep it soft
bl, al = butter(2, 5200 / (SR / 2), "low")
mix = lfilter(bl, al, mix)

# Schroeder reverb
def comb(x, d, g):
    a = np.zeros(d + 1); a[0] = 1; a[d] = -g
    return lfilter([1.0], a, x)
def allpass(x, d, g):
    b = np.zeros(d + 1); b[0] = -g; b[d] = 1
    a = np.zeros(d + 1); a[0] = 1; a[d] = -g
    return lfilter(b, a, x)
def reverb(x, seed):
    ds = [1557, 1617, 1491, 1422]
    y = sum(comb(x, d + seed, 0.82) for d in ds) / 4
    for d in (225, 556, 441):
        y = allpass(y, d + seed // 2, 0.6)
    return y
L = mix * 0.75 + reverb(mix, 0) * 0.45
R = mix * 0.75 + reverb(mix, 23) * 0.45
st = np.stack([L, R], 1)
fade = np.ones(N); fo = int(1.6 * SR); fade[-fo:] = np.linspace(1, 0, fo) ** 2
st *= fade[:, None]
st /= np.max(np.abs(st)) / 0.89  # peak about -1 dBFS
sf.write(sys.argv[1], st.astype(np.float32), SR)
print(sys.argv[1], DUR, "s")
