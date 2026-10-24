"""Stand-in narration with local Kokoro, until the ElevenLabs take arrives.
Usage: python3 scripts/tts_placeholder.py <voice> <speed> <out.wav>"""
import re, sys, numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
voice, speed, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
k = Kokoro("/root/models/kokoro-v1.0.onnx", "/root/models/voices-v1.0.bin")
text = open("scripts/script.txt").read()
paras = [p.strip() for p in text.split("\n") if p.strip()]
chunks, sr = [], 24000
for pi, p in enumerate(paras):
    for s in re.split(r"(?<=[.?!])\s+", p):
        a, sr = k.create(s, voice=voice, speed=speed, lang="en-us")
        chunks.append(a)
        chunks.append(np.zeros(int(sr * 0.16)))
    chunks.append(np.zeros(int(sr * 0.28)))
audio = np.concatenate(chunks)
sf.write(out, audio, sr)
print(out, round(len(audio) / sr, 2), "s")
