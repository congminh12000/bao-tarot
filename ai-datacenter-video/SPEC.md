# SPEC — "Where your question goes"

GOAL:    The viewer ends the film picturing a real building, miles away, humming with heat,
         water and power, every time they hit enter on an AI prompt.
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    ~50–56 s (follows the voiceover) x 30 fps. The voice is the clock: every beat starts on its anchor word.

LOOK:    TED-Ed-style flat vector with depth. Every object is built from 2–4 facets of one hue
         (light face = base, shade face = base darkened 18–28%, rim/highlight = base +20% at 60%).
         Key light from upper left (shadows fall right/down, offset 14 px, blur 0, opacity 0.25 in shade colour).
         Soft layered light: radial pools behind the hero at 20–35% opacity; glows only on light sources
         (lamp, screen, data pulses, hot chips), never on type.
         Paper grain overlay 4% (SVG turbulence, static), vignette 18% at the corners.
         Drifting sparkles: 4-point stars, 6–14 px, 12–24 per scene, opacity 0.25–0.7, drift 20–40 px over the scene.
         Isometric buildings and halls on a 30° grid (x-axis cos30, y-axis sin30).

PALETTE (only these):
  Backgrounds  night teal #1E3F4F · dusk teal #2F5F6F · apricot sky #F2B880 · cream light #FBE6C4
  Accents      tangerine #FF7A45 (heat, the accent word) · lamp gold #FFD15C (light, data pulses)
               aqua #5ED6C6 (cold water, chips at rest)
  Mid tones    deep shade #15303D · slate #4F7F8A · clay #C7876A · plum #7E4F66 · rose #E9A58A
  Floors/land  sage #6E9C6C · moss #4B7457 · oak #D4A372 · oak shade #A87A50 · asphalt #5E6B75 · asphalt dark #46525C
  Skin #E7A884 / shade #C98468 · hair #35222E (both characters, drawn in the same facet style)

TYPE:    MAIN   Nunito 800, titles 76–96 px, tracking -1%; secondary lines Nunito 700, 44–52 px.
         ACCENT Caveat 700 — exactly one word in the film ("made" in scene 6), 120 px, tangerine.
         LABEL  Barlow 600/700 caps, 26–30 px, tracking +6%, for small labels and numbers only.
         On-screen words never repeat the voiceover sentence; they label things (six words, "miles away",
         "AI data center", numbers, "1,000+", "2019").

OBJECTS: laptop (aluminium wedge, faceted lid, glowing screen, keys), desk lamp, mug, window with dusk sky;
         the woman (dark bob, apricot sweater, faceted face, blinking); house (isometric, lit windows);
         street cutaway (asphalt slab, soil layers, conduit with fibre glowing); data center (long isometric
         warehouse, ribbed walls, rooftop chillers with fans, fence, substation, cooling towers);
         server hall (rows of racks with blinking LEDs, cold-aisle floor); chip (die with gold pins,
         grid of cores); technician (hard hat, teal coveralls with tangerine stripe, tablet);
         water pipes (aqua), power meter, small city skyline, flat world map.

MOTION:  camera: power2.inOut, 1.2–2.0 s pushes/pans on a world wrapper per scene.
         arrivals: expo.out / power4.out 0.5–0.8 s; springs back.out(1.6) on popping objects only.
         exits: power3.in, 40% shorter than entrances. Staggers: words 0.08 s, objects 0.05 s.
         character acting: offset parts (head leads 2 frames, arms follow), idle blink every 2.5–4 s.

SHOTS:   see PLAN in the delivery note / scene files compositions/s01…s08. Transitions are causal:
         push into the screen → words fly out the window → pull out to house → drop through street
         → follow cable to building → roof lifts → dive into chip → pull out to hall → rise to roof
         → pull to landscape with city → pull out to globe → globe zooms back to her window.

BANNED:  dark empty void with small floating things; bullet lists; three cards in a row; KPI grids;
         titles that drift after they land; every element fading + sliding up; glow on text;
         corner labels / HUD decoration; logos; any colour outside the palette.

QA:      one frame mid-scene for every scene; the transitions at each seam; text ≥ 28 px; 
         every script line has a picture (see the line → picture map in PLAN.md).
