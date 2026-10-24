"""Local word-level transcription (Parakeet TDT via sherpa-onnx). Works on any voice file,
including the ElevenLabs take. Usage: python3 scripts/transcribe.py <audio> <out.json>"""
import json, subprocess, sys, numpy as np, sherpa_onnx
src, out = sys.argv[1], sys.argv[2]
M = "/root/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8"
rec = sherpa_onnx.OfflineRecognizer.from_transducer(
    encoder=f"{M}/encoder.int8.onnx", decoder=f"{M}/decoder.int8.onnx",
    joiner=f"{M}/joiner.int8.onnx", tokens=f"{M}/tokens.txt", model_type="nemo_transducer")
pcm = subprocess.run(["ffmpeg", "-v", "quiet", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
audio = np.frombuffer(pcm, dtype=np.float32)
# chunk on ~20 s windows split at silences so long files stay accurate
win, sr, words, pos = 20 * 16000, 16000, [], 0
while pos < len(audio):
    end = min(len(audio), pos + win)
    if end < len(audio):  # back off to the quietest 50 ms in the last 3 s
        seg = audio[end - 3 * sr:end]
        e = [np.abs(seg[i:i + 800]).mean() for i in range(0, len(seg) - 800, 400)]
        end = end - 3 * sr + int(np.argmin(e)) * 400 + 400
    st = rec.create_stream(); st.accept_waveform(sr, audio[pos:end]); rec.decode_stream(st)
    r = st.result
    cur = None
    for tok, t in zip(r.tokens, r.timestamps):
        t = t + pos / sr
        if tok.startswith(" ") or cur is None:
            if cur: words.append(cur)
            cur = {"text": tok.strip(), "start": round(t, 3), "end": round(t + 0.08, 3)}
        else:
            cur["text"] += tok; cur["end"] = round(t + 0.08, 3)
    if cur: words.append(cur)
    pos = end
for i in range(len(words) - 1):  # a word lasts until the next begins (capped)
    words[i]["end"] = round(min(words[i + 1]["start"], words[i]["start"] + 0.9), 3)
json.dump(words, open(out, "w"), indent=0)
print(len(words), "words; last at", words[-1]["start"])
print(" ".join(f'{w["text"]}@{w["start"]}' for w in words))
