"""Synthesised sound effects the bundled library has no take for: sizzle, running water,
an electrical hum and a short splash. Usage: python3 scripts/sfx_synth.py assets/audio/sfx"""
import sys, os, numpy as np, soundfile as sf
from scipy.signal import butter, lfilter

SR = 44100
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
rng = np.random.default_rng(7)

def bp(x, lo, hi):
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], "band"); return lfilter(b, a, x)
def lp(x, f):
    b, a = butter(2, f / (SR / 2), "low"); return lfilter(b, a, x)
def fades(x, i, o):
    x = x.copy(); ni, no = int(i * SR), int(o * SR)
    x[:ni] *= np.linspace(0, 1, ni); x[-no:] *= np.linspace(1, 0, no); return x
def norm(x, peak=0.85): return x / np.max(np.abs(x)) * peak

# sizzle: crackly high noise
n = int(2.6 * SR)
s = bp(rng.standard_normal(n), 2500, 9000)
crack = (rng.random(n) < 0.0016).astype(float)
crack = lfilter([1], [1, -0.995], crack) * rng.standard_normal(n)
s = s * 0.5 + bp(crack, 1500, 7000) * 3
s *= 0.7 + 0.3 * np.sin(np.arange(n) / SR * 2 * np.pi * 3.1)
sf.write(f"{out}/sizzle.wav", norm(fades(s, 0.15, 0.6), 0.6).astype(np.float32), SR)

# water: low rushing noise with bubbles
n = int(6.5 * SR); t = np.arange(n) / SR
w = lp(rng.standard_normal(n), 900) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.7 * t))
bub = np.zeros(n)
for k in range(70):
    t0 = rng.random() * 6.2; f0 = 300 + rng.random() * 600; d = 0.06 + rng.random() * 0.05
    i = int(t0 * SR); m = int(d * SR); tt = np.arange(m) / SR
    bub[i:i + m] += np.sin(2 * np.pi * (f0 + 2500 * tt) * tt) * np.exp(-tt * 40) * 0.6
x = w * 0.7 + bub
sf.write(f"{out}/water.wav", norm(fades(x, 0.5, 1.0), 0.7).astype(np.float32), SR)

# hum: mains hum swelling up with the power meter
n = int(3.2 * SR); t = np.arange(n) / SR
h = sum(np.sin(2 * np.pi * 120 * k * t) / k for k in range(1, 6))
h *= np.clip(t / 0.8, 0, 1) * (0.85 + 0.15 * np.sin(2 * np.pi * 9 * t))
h += bp(rng.standard_normal(n), 3000, 8000) * 0.08 * (rng.random(n) < 0.3)
sf.write(f"{out}/hum.wav", norm(fades(h, 0.05, 0.8), 0.6).astype(np.float32), SR)

# splash: short bright burst of water drops
n = int(0.9 * SR); t = np.arange(n) / SR
sp = bp(rng.standard_normal(n), 800, 6000) * np.exp(-t * 7)
for k in range(12):
    i = int(rng.random() * 0.5 * SR); m = int(0.05 * SR); tt = np.arange(m) / SR
    sp[i:i + m] += np.sin(2 * np.pi * (700 + 1800 * tt * 20) * tt) * np.exp(-tt * 60) * 0.5
sf.write(f"{out}/splash.wav", norm(fades(sp, 0.005, 0.3), 0.7).astype(np.float32), SR)
print("ok")
