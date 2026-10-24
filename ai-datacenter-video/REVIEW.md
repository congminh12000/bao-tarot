# Review notes

## Creative calls
- Followed the given script line by line; one scene per idea (see `PLAN.md`). No storyline alternatives — the script is the story.
- Fonts (the brief left them blank): **Nunito** (main), **Caveat** (one accent word, "here." in scene 3),
  **Barlow** (labels and numbers). All downloaded from Google Fonts into `assets/fonts/`.
- Palette (the brief left it open): dusk teal / night teal backgrounds, tangerine (heat) + gold (light, data)
  + aqua (cold water) accents, slate/plum/clay/rose mid tones, sage/moss/oak/asphalt floors. Listed in `SPEC.md`
  and `scripts/kit.mjs` (`P`). Nothing outside it is used.
- Look: faceted flat vector (each object = lit face + shade face + highlight), key light from upper left,
  soft radial light pools, drifting four-point sparkles, paper grain 10% overlay + vignette, isometric
  buildings / server halls, camera moves on every scene.
- Seams use different transitions: hard cut on a matching window, cut + bass hit, dive into the glowing rack,
  colour match (hot chip → hot hall), whip, cut to a dot that pulls out, iris.
- Token numbers in scene 4 are illustrative, not a real tokenizer's output.
- "1,000+" and "since 2019" are taken from the script as given; not independently checked.

## Measured vs looked at
- `hyperframes check`: 0 errors. Kept warnings: decorative text under 28 px (the tiny prompt on the laptop
  screen in the wide shot, the "3×7" sums inside the chip cores — texture, not reading text), two contrast
  warnings on those same sums, one overlapping tween on a pulse for 0.05 s (harmless).
- Every scene midpoint, each seam (±0.2 s) and the phone-width sheet were looked at.
- The sound was measured (peaks placed one frame after the picture), **not heard**.

## Placeholders
- Voice: stand-in local Kokoro voice ("af_heart") until the ElevenLabs take arrives. Then: transcribe it
  with `scripts/transcribe.py`, move the scene starts in `index.html` and the anchors in each scene file.
- Music: synthesised in code (`scripts/music.py`) because no music model or library is reachable from this
  machine. Swap `assets/audio/music-bed.wav` for any track.

## Weakest shot / next
- Scene 6 (balance) is the plainest world — it could use a power line running from each pan into the landscape.
- The woman's profile face is simple; a second pass on her hands and a 3/4 face would lift the bookends.
