# Scene plan — "Where your question goes"

Times are from the stand-in voiceover (Kokoro, 50.6 s). When the ElevenLabs take arrives, it gets transcribed
locally (`scripts/transcribe.py`) and every anchor below moves to the new word times.

| # | Time | Script line | What the picture shows | Into the next scene |
|---|------|-------------|------------------------|---------------------|
| 1 | 0.0–8.6 | "You type a question. How do I make potato salad? You hit enter, and it feels like the answer lives inside your laptop. But your six words just left your house." | Dusk bedroom, the woman typing at her laptop, desk lamp glowing. The camera pushes **through the screen**; the question types out letter by letter; the send button is pressed. Back in the room, an **x-ray lens** over the laptop shows a little glowing bowl of potato salad "living" inside — on "But" it pops in a puff. The **six words** burst out of the screen as tiles ("6 WORDS") and race out of the window. | Hard cut on the window → the same window seen from outside |
| 2 | 8.6–14.0 | "They raced through the cables under your street and landed in a building like this, miles away." | Cross-section: her house, the street cut open, a fibre conduit under the asphalt. The words drop down the riser and become **six gold light pulses** racing along the cable, past hills, trees and power poles (parallax), until they climb into a long warehouse that lights up. "MILES AWAY" with a dashed arrow back along the route. | Cut + bass hit |
| 3 | 14.0–20.5 | "This is an AI data center. A giant warehouse packed with computers, and it's where your answer actually gets made." | Isometric hero of the data center: rooftop chillers spinning, substation, fence, trees, a tiny car and person for scale. Title "AI data center". The **roof lifts off** and the walls drop to reveal rows of **server racks** (label). Her question drops in as a gold pulse and one rack lights up; a hand-drawn arrow and the accent word **"here."** (Caveat). | Camera dives into the glowing rack |
| 4 | 20.5–27.6 | "Inside, rows of chips turn your words into numbers and run billions of tiny math problems on them, all at the same time." | Isometric server board, **rows of chips** with heat sinks; the camera dives into one. Top-down die: the six words arrive and **flip into numbers** (illustrative token IDs), pour into the chip; a **wave of tiny sums** (3×7, 8+5…) rolls across the cores one by one — then **every core flashes at once**. The chip starts to glow tangerine. | Match on colour: hot chip → hot racks |
| 5 | 27.6–37.3 | "All that math makes heat. A lot of it. So the data center pumps cold water past every rack, and burns even more power just to stop the chips from cooking themselves." | Server hall in tangerine: heat waves rise, thermometer climbs, "TOO HOT", the **technician** wipes his brow. He taps his tablet: **aqua water pipes** appear, water flows past every rack, the hall cools to teal. The **power meter** swings into the red, current races down the cables. Gag inset: a chip **frying an egg**, steam rising — cold water splashes, the chip turns aqua. | Whip pan |
| 6 | 37.3–41.9 | "One AI data center can use as much electricity as a small city." | A big **balance** at dusk: the data center drops onto one pan and slams it down; lightning crackles; a **small city** drops onto the other pan — the beam levels out and the city's windows switch on. | Cut to one dot on a globe |
| 7 | 41.9–46.5 | "And since 2019, more than a thousand of them have gone up around the world." | Pull out from a single dot to a turning **globe**. "SINCE 2019", a counter rolls to **1,000+** "AI DATA CENTERS", and dots pop up across the continents. | Zoom into one dot → iris |
| 8 | 46.5–52.5 | "So the next time you ask AI something, that's where your question goes." | Iris opens on her room, now at night. She types again; a gold pulse leaves her laptop, crosses the window sill and travels over the dark hills to a **data center glowing on the horizon** through her window. The answer comes back: a potato-salad recipe on her screen, and she smiles. Hold. | End |

## Sound

- **Voice:** stand-in local voice until the ElevenLabs file arrives (swap `assets/audio/vo-placeholder.wav`).
- **Music bed:** soft 80 BPM mallet-and-pad bed in D major, synthesised locally (`scripts/music.py`): pad only for the
  opening, mallet arpeggio enters at the data center reveal, drops out for the heat (a low pulse instead), returns
  with the cold water, lifts an octave for the globe, resolves under the last line. Sits at 0.16 under the voice.
- **Effects (53 placed cues, `scripts/audio_cues.py`):** typing, the enter click, pops on the lens and the poof,
  sparkle on the word tiles, whooshes on each camera move, a riser into the data center reveal (once),
  key ticks as words become numbers, a ping when every core fires, sizzle for the heat and the frying egg,
  running water, an electrical hum, a splash, thuds as the balance drops, dot pops on the globe, a chime as
  the answer arrives. Each clip's peak lands one frame after its picture.
