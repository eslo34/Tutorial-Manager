# RULES — bim.com OpenDictionary Walkthrough Videos

A reusable playbook — the accumulated revision notes from every video built so far — for
building animated, narrated tutorial videos of the bim.com
**Open Dictionary** admin UI. Every video is a different *script* over the **same codebase**
and the **same animation framework** described here. **Read this before starting a new video**
so the first draft already has the things we always end up asking for.

> This file is codebase-general. It deliberately contains **no** content specific to any one
> video's narrative (which screens, which property/template names, which flow). Bring it,
> plus the framework files below, into each new project.

## Reusable framework files to carry over
These are not video-specific — copy them into each new project as-is and build on top:
- `anim-engine.jsx` — the camera/cursor/ripple/typing/transition engine (`window.Walkthrough`).
- `animations.jsx` — the Stage starter (timeline / scrubber / `useTime`).
- `assets/` — `components.css`, `colors_and_type.css` (fonts), `app.css` (shared chrome +
  component styles), `app.js` (icon injector + scaler), `bim-logo-dark-square.svg`, `fonts/`.
- The `partN-export-standalone.html` build recipe (see Export).

## What we're building (the pipeline)
Per video: faithful static **screens** → a **storyboard** (design canvas, for sign-off) →
an **animation** (camera + cursor walkthrough over the screens) → a **single-file exporter**
that renders a 1920×1080 / 60fps PNG sequence for Premiere.
**Build the storyboard FIRST and get sign-off on the static pages before animating.**

## File layout (everything lives in `screens/`)
- Static screens: one `*.html` per scene. Structure is **exactly**:
  `<div id="fit"><div class="screen" data-screen-label="..." [style="height:NNNNpx"]> … </div></div>`
  then `<script src="assets/app.js"></script>`.
  Icons are `<i data-ico="name"></i>` (injected to inline SVG; **never an icon font** — CDN
  fonts don't rasterize in export and are blocked in the in-app preview).
- `storyboard-data.json` — extracted `.screen` markup keyed by scene id. Regenerate whenever a
  screen changes (read each file, slice from `<div class="screen"` to
  `\n</div>\n<script src="assets/app.js">`, JSON-stringify). The player + exporter read this.
- `storyboard.html` — design_canvas with a section per video. Inlines screens via
  `fetch('storyboard-data.json')` + `dangerouslySetInnerHTML`, then retries `ODInjectIcons`.
- `partN-scenes.js` — `window.PARTN = { scenes, duration, introDur }`.
- `animation-partN.html` — player (fetches storyboard-data.json + partN-scenes.js).
- `partN-export-standalone.html` — self-contained exporter (everything inlined).

## The engine — scene object reference
Each scene: `{ id, in, out, h, enter, fade, targets, reveal, cam, cursor, clicks,
typing, pops, slides, slideOuts, fades, checks, removes }`.

Timeline / framing:
- `in` / `out` — absolute timeline seconds. Scenes chain: each scene's `in` = previous `out`.
- `h` — screen height (default 1080). **Tall forms** pan vertically inside the fixed 1080
  frame; the engine is height-aware (clamps + normalizes y by `h`). Set the screen's `.screen`
  inline `style="height:NNNNpx"` **and** the scene `h` to match.
- `enter: 'crossfade'` + `fade` — dissolve from the previous scene (overlapping opacity).
- `enter: 'dissolve'` — like crossfade but the OUTGOING layer stays fully **opaque**
  underneath while the new one fades in on top, so the stage background never bleeds
  through at the midpoint. Use it for "invisible" cuts between identical frames — a plain
  crossfade dips through the cream background and reads as a **brightness flash**. Keep
  plain `'crossfade'` for genuine page changes (the dip avoids ghosting two layouts).
- `targets` — selectors the engine measures each frame. **A selector used as a cam/cursor
  target MUST be listed in `targets`**, else it silently falls back to frame center (wrong
  framing). `[x,y]` scene-coords and `'center'` don't need to be listed.
- `cam` — `[{ t, scale, target }]`, `t` ABSOLUTE. The engine interpolates the final
  `(tx,ty,scale)` between keyframes (no per-frame focus math → no shake).
- `cursor` — `[{ t, target }]`, `t` ABSOLUTE. `target` = selector, `[x,y]`, `'center'`, or
  **`'inherit'`** (see Cursor continuity). To **hide the cursor** for a beat, target an
  off-screen point just below the frame (e.g. `[960, 1320]`) — never `display:none`.
- `clicks` — absolute times; draws an anchored click pulse + a cursor press (scale-down).

Reveal / type (timing is **scene-relative**: `revealT = time − in`):
- `reveal` — `{ selector, stagger, dur, delay, dy }`; rows/cards ripple in (translateY+fade).
  Use `'.__noripple'` for none.
- `typing` — `[{ sel, start, cps }]`; types a field's existing text from empty with a focus
  ring + caret. The HTML keeps the final text (storyboard looks right); the engine animates
  from empty.

**Recipe — REPLACING existing text (select-all → delete → retype).** `typing` only types into
an *empty* field; to show a field's current value being *rewritten* (e.g. clarifying a
definition), compose primitives over three stacked spans inside the field box
(`position:relative`), each animated by exactly ONE `fades` entry (two fades on the same element
fight — the later one wins every frame, so never stack them):
  ```html
  <div class="input area fr-defbox">
    <span class="fr-def-original">           <!-- wrapper: fades 1→0 to "delete" BOTH children at once -->
      <span class="fr-def-old">old text…</span>
      <span class="fr-def-sel">old text…</span>  <!-- identical copy; color:transparent + selection-blue bg -->
    </span>
    <span class="fr-def-typed">new text…</span>     <!-- opacity:0; engine types this from empty -->
  </div>
  ```
  - `checks: [{ sel:'.fr-defbox', start:S }]` — turn on the focus ring (CSS-gate `.fr-defbox.on`).
  - `fades: [{ sel:'.fr-def-sel', from:0,to:1, start:S+0.3, dur:0.4 }]` — the selection highlight
    sweeps in (a transparent-text copy with a `rgba(120,160,245,.55)` background + `box-decoration-break:clone` wraps each line exactly like a real selection).
  - `fades: [{ sel:'.fr-def-original', from:1,to:0, start:S+1.2, dur:0.22 }]` — delete: collapse
    the old text **and** its highlight together (one fade on the shared wrapper, not two).
  - `fades: [{ sel:'.fr-def-typed', from:0,to:1, start:S+1.5, dur:0.2 }]` **+**
    `typing: [{ sel:'.fr-def-typed', start:S+1.5, cps:38 }]` — reveal + type the new wording.
    Give `.fr-def-typed.tf-typing::after` the caret CSS (the engine toggles `tf-typing` on it).
  Hold the camera on the field through the whole sequence; only pan to the submit button after
  the last character lands + a readable beat.

Transitions / state-change primitives (all **scene-relative** `start`):
- `slides` — `[{ sel, from:[x,y], start, dur }]`; slide an element **in** from an offset to 0
  (drawer/flyout opening, tab indicator).
- `slideOuts` — `[{ sel, to:[x,y], start, dur }]`; slide an element **out** from 0 to an
  offset (drawer/flyout closing).
- `fades` — `[{ sel, from, to, start, dur }]`; opacity tween (backdrop dim in/out; a
  badge / pagination footer / any affordance fading in once an action takes effect).
- `pops` — `[{ sel, start, dur, origin }]`; scale+fade a menu/popup/modal in. Pre-hidden on
  mount. `origin:'center'` for modals, `'top left'/'top right'` for dropdowns/menus.
- `checks` — `[{ sel, start }]`; toggles `.on` on a checkbox element at its click time (the
  glyph/fill should be CSS-gated on `.on` so it only appears on the click).
- `removes` — `[{ sel, start, dur, stagger }]`; **reverse-ripple**: staggered fade **and
  collapse** of rows (filtered-out list rows leaving). The engine wraps each removed row's
  cells in a clip div and animates td-height + wrapper max-height to 0, so the table truly
  reflows and the card shrinks — no leftover empty space, no `display:none` snap.

## ✅ FIRST-DRAFT CHECKLIST (what we always revise toward)

### Camera / motion
- [ ] **Camera target === cursor target** on every zoom. Aim at the exact cell/button/pill,
  never a full-width row (its centre is the screen middle).
- [ ] **One zoom per beat.** No two near-identical cam targets back-to-back (causes a little
  secondary zoom after the first settles). Single move, then hold.
- [ ] **Start a video fully zoomed out** (scale 1, whole window), then one zoom in.
- [ ] **Match framings across cuts** — the next scene's first cam keyframe ≈ the previous
  scene's last framing, so a crossfade reads as one continuous move (no jump/secondary zoom).
- [ ] **A click that opens a flyout/page must read as ONE continuous move:** the next scene
  opens at the previous scene's ending framing AND ending cursor (`'inherit'`), so the
  element appears to slide open under the same camera — no teleport, no visible cut.
- [ ] **Consistent pace.** Keep zoom + cursor moves ~1–1.5s each. A tightened timeline must
  NOT make the move right after a click fast — verify speeds look uniform end to end.
- [ ] **Concrete pacing numbers (use these, don't eyeball "medium speed").** These are the
  values that read calm-but-not-sluggish in the Part 3 build — start here and only deviate with
  reason:
  - **Camera pan/zoom between beats: 1.2–1.5s** of travel (e.g. `{t:9.0 … '.fr-version'}` →
    held from `{t:11.2 …}` is a 1.5s settle then a 2.2s hold). Never < 1.0s for a pan the viewer
    is meant to follow — 0.4–0.8s pans (what we had first) feel snappy/jerky and always get
    flagged.
  - **Hold after a move (beat dwell): 1.0–2.2s** before the next move, so VO has room.
  - **Opening pull-out** (page lands zoomed → full window): **~1.5s** (`1.45 → 1.0`).
  - **Initial wide hold** at a new screen while rows ripple: **~0.9s** before the first zoom.
  - **Cursor glide to a target: ~1.0–1.2s**, arriving ~0.1s before the camera settles; then a
    short dwell before the click.
  - **The 0.1s rule still holds:** `out = lastClick + 0.1`, next scene `in = previous out`.
  - A whole ~4-screen flow lands around **25–30s** at this pace. If it feels rushed, the fix is
    longer holds + slower pans (raise the gaps between keyframes), never faster cuts.

### Cursor continuity
- [ ] **The cursor never teleports across a cut.** Give every non-opening scene
  `cursor[0].target = 'inherit'` — it resumes from exactly where the previous scene's cursor
  ended (mapped into this scene's coords), then eases to the next target at a normal pace.
  (The engine renders the cursor in stage space and blends across the crossfade; `'inherit'`
  zeroes the blend distance so there's no fast jump.) Verify by measuring the cursor div's
  screen rect just before/after each cut — it should be continuous.
- [ ] Cursor presses (scale-down) land on `clicks` times.

### Click feedback
- [ ] The **click ring rings out fully** and stays **anchored at the press location** even
  after the scene changes — the engine gathers clicks globally and pins the ring to where the
  cursor was at click time. Don't reintroduce per-scene-only pulses (they get cut off).

### Reveals / typing
- [ ] New screen's rows/cards **ripple in** on entry (don't just appear).
- [ ] **Completed ripple rows clear their inline transform/opacity/will-change** so they stop
  being their own compositing layer — otherwise html-to-image snaps each layer to whole pixels
  and the **text jitters ±1px** in exported frames (invisible in live preview!). (The engine
  does this; don't defeat it.)
- [ ] Typed fields are **framed** (field + button both considered) with a focus ring + caret.
  **Let typing finish completely — and hold a readable beat — BEFORE the camera moves to the
  confirm/submit button.** Camera holds on the field while typing.
- [ ] Popups/menus/dropdowns **appear on click** (`pops`), not pre-shown. Remove any
  "always-on" hover highlight unless it's the click moment.

### Pacing (the 0.1s rule)
- [ ] **Every button press is followed by ~0.1s, then its resulting animation plays** — for
  EVERY click that triggers something (page change, drawer open/close, menu pop, filter,
  modal, submit). Set each scene's `out = lastClick + 0.1` and chain `in = previous out`; no
  dead hold after a click, no rushed move either.

### Transitions: crossfade vs. in-place change
- [ ] **Crossfade is only for a genuine page change.** For an **in-place UI change** (drawer
  open/close, filter apply, menu, modal, item add/remove) do NOT cross-dissolve to a different
  layout. Instead:
  1. Make the next scene's screen **identical to the previous screen at the cut** (same rows,
     drawer still present, new affordances pre-hidden) so the crossfade is invisible, then
  2. **Animate the actual change** with `slides` / `slideOuts` / `pops` / `removes`, and
  3. **`fades` in** any affordance that only appears once the action took effect (a filter
     "1" badge, a pagination footer, a backdrop dim).
- [ ] **Opening a drawer/flyout:** `slides` it in **+ backdrop `fades` 0→1**.
- [ ] **Closing a drawer/flyout:** `slideOuts` it out **+ backdrop `fades` 1→0**, triggered by
  clicking the **primary action** (Apply / Add / Confirm), **not the ✕**, when the click also
  applies a change.
- [ ] **Applying a filter:** on the action click, slide the drawer out and `removes`
  (reverse-ripple + collapse) the non-matching rows so only the matches remain; fade in the
  filter badge + pagination footer.
- [ ] **Modal:** `pops` the card in (`origin:'center'`) **+ backdrop `fades` 0→1**, over the
  **same background** (zoom out to reveal it) — **not** a crossfade dissolve. The backdrop dim
  should be subtle (~0.30, not ~0.45) so the white card pops; anchor the backdrop to the
  viewport (`inset:0…; height:1080px`) when the screen is taller than 1080.
- [ ] **Adding an item via a flyout:** on the action click, `slideOuts` the flyout away to
  reveal the updated form (which already shows the added item). The slide-out screen =
  the updated form **with the flyout overlaid** so it can leave.
- [ ] **State change (row removed, item added, value changed):** show it via slide/ripple/
  collapse over a matching background — never a crossfade dissolve between two different states.
- [ ] **Blocked action → fix → retry = ONE merged screen.** When a click first fails (red
  validation / blocked state) and then succeeds, author it as a single screen and animate
  error-in (`pops`/`fades`), the correction, error-out, then success — never crossfade
  between a "blocked" copy and an "allowed" copy of the same page.
- [ ] **Identical-frame cuts use `enter:'dissolve'`,** not `'crossfade'`, so the stage
  background can't flash through at the midpoint (see the engine reference above).

### Intro
- [ ] Intro only if asked. The logo intro uses `introDur`; set `introDur: 0` to drop it (and
  start scene 1 at `in: 0`, else pre-first-scene frames fall back to the last scene).
- [ ] Intro text must avoid `overflow:hidden` reveal masks — html-to-image clips transformed
  children of overflow:hidden boxes. Use opacity/translate + `white-space:nowrap`.

## Concept / interstitial scenes — morphing a real UI element into a diagram
Some videos cut from the product walkthrough to a **conceptual interstitial** that explains an
idea (e.g. "one concept · many versions"). These are NOT built with the scene-object engine
above — they're **hand-authored React scenes** driven directly by `useTime()` (the same clock
the engine uses), living in their own `*-scene.jsx` + a tiny `clip-*.html` host that mounts a
`<Stage>` and the scene. Reach for this pattern whenever the motion is a bespoke
diagram/illustration rather than a cursor-over-screens walkthrough.

The thing that makes these read as *premium* rather than slop: **don't fade out the UI and fade
in new graphics.** Instead, pick ONE real element from the preceding screen and treat it as a
**physical object** — keep it on screen, glide it to its new home, and morph its contents in
place while everything around it dissolves. The same box becomes the diagram's emblem.

### Series consistency — interstitials are a family
- Every interstitial clip shares ONE visual vocabulary: warm radial background, the property
  **emblem** card, green CTA version chips, bézier "net" connectors, Familjen Grotesk
  captions. A new clip must reuse this vocabulary — don't invent a new look per clip, so the
  clips read as one series across the whole video set.
- **No title cards.** Open straight on the content (or on the previous part's exact end
  frame) unless explicitly asked for one.
- **Captions: one idea at a time.** Author a `CAPTIONS` array with explicit in/out times;
  centered near the bottom of frame, `white-space:nowrap`, timed to the VO. The previous
  caption fades out before the next fades in — never two captions on screen at once.
- **Everything is a pure function of `t`** (all beats in one `T = {…}` table of absolute
  seconds) so the clip scrubs and exports identically — no setInterval / CSS-transition state.
- **Elements centered with `translateX(-50%)` need a centered rise variant** (`riseC`) that
  preserves the −50% while animating Y — a plain `translateY` rise overwrites the centering
  transform and the element jumps sideways as it enters.

### Recipe: reuse a real card as a morphing object
1. **Open on the real screen, not a recreation.** Embed the actual end frame
   (`fetch('storyboard-data.json')` → `dangerouslySetInnerHTML`) and apply the same camera zoom
   the Part-1 animation ended on, so the clip is seamless with what came before. Re-run
   `ODInjectIcons` on the injected node.
2. **Measure the target element's *apparent* (post-camera) rect** in a `useLayoutEffect`, and
   convert it to stage (1920×1080) coords:
   ```js
   const sr = screen.getBoundingClientRect();              // the embedded .screen
   const cr = card.getBoundingClientRect();                // the element we'll reuse
   const rx = (cr.left - sr.left) / sr.width  * 1920;      // raw scale-1 stage coords
   const ry = (cr.top  - sr.top ) / sr.height * 1080;
   // apparent centre = where the clone must sit to overlay the real card exactly:
   const cx = (rx + rw/2) * cameraScale + tx;
   const cy = (ry + rh/2) * cameraScale + ty;
   ```
   Re-measure on a few `setTimeout`s (100/350/650/1000ms) because fonts/icons shift layout.
   **Seed a deterministic `FRAME0`** (camera transform + card rect precomputed from the fixed
   1920×1080 layout) and let the async measurement only *refine* it — this guarantees a
   correct first frame even if measurement is slow or never runs (otherwise the screen
   renders unzoomed for a beat and the clone floats away from the real card).
3. **Lay a pixel-identical clone exactly over the real card**, then dissolve the embedded screen
   underneath it. The clone MUST reuse the **same classes and the same inline icons** as the
   real card (copy the icon SVGs from `app.js`) so the hand-off is invisible — a clone that's
   missing the little copy/external-link/chevron glyphs will visibly *jump* and **double** text
   at the cut. The clone is **solid from frame one** (no fade-in) sitting over the real card; only
   the background behind it fades. (We learned this the hard way — a faded-in clone + a faded-out
   screen cross-dissolve looks soft and shows doubled text for a few frames.)
4. **Separate "move" progress from "morph" progress.** Use two eased ramps:
   `pPos` (glide + scale toward the emblem slot) starts **while the background is still
   dissolving** so the card lifts off the page instead of waiting for it to clear; `p` (the
   content morph) starts a beat later so nothing overflows the shrinking box.
   ```js
   const pPos = seg(t, hold+0.16, morphB-0.2);   // position/scale
   const p    = seg(t, morphA,    morphB);        // contents
   const ccx  = lerp(cardCx, EMBLEM_X, pPos);     // glide
   const cW   = lerp(cardW,  EMBLEM_W, p);        // resize with the morph
   ```
5. **Morph children in place — shed and grow.** Things that don't belong in the diagram
   **collapse away** (`opacity` + `maxHeight` + `marginBottom` → 0, with `overflow:hidden`);
   things that do **grow in** the same way from 0. The kept element (here the name) tweens its
   `fontSize`/`lineHeight`/`letterSpacing`. Container `borderRadius`, `padding`, and
   `boxShadow` all `lerp` from card-styling to emblem-styling across `p`.
   - **Grow every new dimension from zero — never hardcode one.** A fixed `height:'52px'` on the
     incoming diamond held the collapsed name-row open and made the card visibly **taller right
     after the hand-off**. Tie width AND height to the same grow ramp (`width:px(d)`,
     `height:px(d)`) so the box's height never jumps.
   - If the reused element is a link (`<a class="fly-name">`), **drop its underline as it becomes
     the emblem** (`textDecoration: p>0.15 ? 'none' : 'underline'`) — keep it during the hand-off
     so it still matches the source frame.

### Recipe: build the diagram with SVG line-draws + traveling signals
- **Animate stroke length with a non-wrapping dash, not `strokeDashoffset`.** With
  `pathLength="1"`, set `strokeDasharray={`${q} 2`}` where `q` 0→1 is the draw progress. The
  classic `dasharray="1"` + `strokeDashoffset={1-q}` trick **wraps the dash pattern** and flashes
  a stray glowing cap at the *far* end of the line for a couple frames before it draws in (showed
  up as a "weird greenish thing" at the destination). The `${q} 2` form draws exactly the first
  `q` of the path with nothing beyond it.
- **Use `strokeLinecap="butt"` on a line whose length animates from ~0.** A `round` cap renders a
  near-zero-length dash as a **dot** at the origin (amplified by any glow filter) — a stray blob.
  `butt` makes a tiny start read as a thin sliver instead.
- **A leading "signal" dot must ride the actual curve.** Evaluate the bézier, don't `lerp`
  endpoints (a straight lerp puts the dot *off* a curved path). Add a cubic-bézier helper and
  feed it `q`:
  ```js
  const bez = (a,b,c,d,t) => { const u=1-t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; };
  cx={bez(p0x,c1x,c2x,p1x,q)}  cy={bez(p0y,c1y,c2y,p1y,q)}
  ```
  And **delay the dot's appearance** until its head has travelled clear of the origin label
  (`dotO = clamp((q-0.22)/0.12,0,1) * clamp((0.94-q)/0.08,0,1)`), so it never flashes as a
  disconnected blob next to the node it starts from; fade it out before it reaches the target.
- **Node/importer entrances** use a small overshoot pop:
  `const pop=(t,a,d=0.55)=>{const p=clamp((t-a)/d,0,1);return{o:clamp(p*1.5,0,1),s:0.92+0.08*easeOutBack(p)}}`.
- **"Lit" highlight** when a signal lands: tween a node's ring/`box-shadow`/border-color via a
  `seg(t, lit, lit+0.5)` ramp using `color-mix(... var(--CTA-100) …%)`, so the destination glows
  green exactly as the signal arrives.

### Reusable helpers for hand-authored scenes
Keep these at the top of any `*-scene.jsx`:
```js
const lerp = (a,b,p) => a + (b-a)*p;
const seg  = (t,a,b,ease=Easing.easeInOutCubic) => ease(clamp((t-a)/(b-a),0,1));  // a timed 0→1 ramp
const pp   = (a,b) => clamp((p-a)/(b-a),0,1);   // sub-ramps WITHIN a morph progress p
```
Author beats as a single `T = { hold, morphA, morphB, … }` table of absolute seconds so retiming
is one edit. Gate everything on `useTime()` so it scrubs/exports identically to engine scenes.

### Stitching a hand-authored clip after an engine walkthrough (one player file)
- Keep BOTH layers mounted across the cut (the engine must keep its measured coords) and
  crossfade **opacity only**, ~1.0s wide (`CF0 = WALK_END − 0.5` → `CF1 = WALK_END + 0.5`).
- Offset the clip's internal clock via a window global (e.g.
  `window.__P5CB_OFFSET = WALK_END − 0.4`) so the clip's time-0 lands mid-crossfade —
  content dissolves into content, not into emptiness. The clip's `useTime()` subtracts the
  global; the standalone `clip-*.html` host simply leaves it unset and plays from 0.
- Publish the stitch point from the scenes file (e.g. `callbackAt` / `callbackDur` on
  `window.PARTN`) so the player and the exporter share one timeline length.

## Codebase fidelity (read the real source before inventing UI)
This is the **same Svelte codebase** for every video — these hold regardless of script:
- **Read the relevant `*Form.svelte` / component before mocking a screen.** Match field order,
  labels, control types, table columns, empty states ("No … selected", "No results found").
- **Build the WHOLE page, never a trimmed subset — even the parts the script never touches.**
  A screen is a faithful "set," not a crop of the fields a given beat uses. If the real edit
  form has five sections (Description → Translations → Technical specification → Interconnected
  properties → References) with Example, Countries, Creator's language, Property-type / value-
  constraint radio cards, Data type / Quantity / Unit, etc., reproduce **all of them**, filled
  in plausibly for the entity. The camera simply never pans to the parts we don't discuss — but
  they must exist, so the page reads as the real product and a reviewer can trust the set.
  Long pages become **tall screens** (`.screen style="height:NNNNpx"` + matching scene `h`);
  do NOT shrink the page to fit 1080.
- Property **data types are lowercase** (`float / integer / string / boolean`) — not "Decimal".
- **Editing a published entity = create a NEW VERSION first** (three-dots ▸ New version →
  creates a *draft*), THEN open the edit form. A **major** version bump is a button **inside the
  form**; **minor** bumps are automatic.
- **Edit forms are long.** DataTemplateForm order: Basic Information → Translations →
  Components → Properties and groups → References. Don't start mid-form.
- **Tables match source:** long definitions are `line-clamp:2` + ellipsis (not wrapping);
  give a trailing action/Remove column enough width (~11%) to show fully; long names truncate.
- **Drawers/flyouts read highlighted, not "everything dark":** subtle backdrop dim, slide in
  from the right, left border, white panel pops.
- **Cross-dictionary selection:** a select-properties flyout opens on the **current** dictionary;
  switching the "Selected dictionary" dropdown to another source reloads the list — **show that
  dropdown switch**, and gate the cross-source item's visibility behind it.
- **Replace a referenced item = remove then add:** remove the stale row first (count → 0), then
  open the picker and add the new one.
- **Resolve/handle flow:** detail ▸ a primary "resolve/mark all" action → confirmation modal
  (with an optional note you type) → confirm → resolved footer/summary (decision, note,
  resolved-by / on). Activation/confirmation modals summarize the change + affected items.
- Checkboxes: keep the box ~1rem so the glyph fits; the cursor click lands **on the box** as it
  turns on; gate the glyph on the checked state so it appears on click.
- A new page opens **zoomed out (full window)**; clicking into it (e.g. Edit) should **pull to
  scale 1 during the crossfade** (next scene's first cam keyframe ≈ the clicked button's framing).

## Export (per video)
`partN-export-standalone.html` — one self-contained file (fonts base64-inlined, CSS/JS/screens
inlined, logo as data URI). Assemble it from a previous part's exporter by swapping the inlined
**app.css**, **anim-engine.jsx**, **partN-scenes.js**, and the **OD_SCREENS** JSON (with the
logo path replaced by its data URI), and renaming `window.PARTN`.
Interstitial clips get the same treatment — every `clip-*.html` gets its own
`*-export-standalone.html`, and a plain-English `README.md` (localhost command, exporter URL,
Premiere timebase steps) sits next to every exporter that gets handed over.
**Simple clips can skip the flat-cam pipeline:** if the camera never *holds a zoom over text*
(the clip only animates opacity/translate/scale of whole DOM nodes), capture the full
1920×1080 canvas at 2× supersample and downscale — crisp, jitter-free, much simpler. Reserve
camera-decoupled compositing for cursor-over-screens walkthroughs that zoom.
Workflow: serve over **localhost** in Chrome (the File System Access folder API is blocked on
`file://` and in the in-app preview), click **Export PNG sequence**, pick the video's folder
(each PNG is written straight to disk — flat memory). The `range` box renders in chunks (reload
the tab between chunks to reset memory; frame numbers stay continuous). Premiere:
**Preferences ▸ Media ▸ Indeterminate Media Timebase = 60** before importing, then
File ▸ Import ▸ `frame_00001.png` ▸ tick **Image Sequence**.

## Text-jitter on zoom — the camera-decoupled fix (build it in from day 1)
**Symptom:** in the exported PNG sequence (NOT the live preview), text wobbles ±1 px during any
camera zoom — letters drift apart and back together, individual glyphs jitter. The live preview
is clean because Chrome composites the camera on the GPU with true sub-pixel transforms;
html-to-image's rasterization grid-snaps each frame.
**Root cause:** font **hinting / grid-fitting**. Every frame the camera scale changes slightly,
so each glyph lands at a different sub-pixel position; the browser distorts the glyph outline to
align it to the device-pixel grid, and each glyph crosses its grid-fit threshold at a different
moment — so they snap independently and the text shimmers.
**What does NOT fully fix it:** `text-rendering: geometricPrecision` (suspends hinting) and
supersampling (`pixelRatio: 2` + downscale, averages the snap) each help a little; stacked they
only attenuate — a faint wobble survives. Rounding the camera transform per frame just makes slow
zooms steppy. These are all dead-ends.
**The real fix — camera-decoupled compositing.** Render each scene layer **un-zoomed at scale 1**
in the DOM and apply the camera as a **canvas bitmap transform** when compositing each frame.
Glyphs are rasterized at a constant scale every frame, so they cannot re-grid-fit and the zoom
CANNOT jitter — by construction. Cursor and click-pulse are drawn as vectors on top of the
composite. Wire it into the standalone exporter like this:
1. **`SceneLayer({ ..., flat })`** — when `flat`, render `transform:'none'`, `opacity:1`, the
   layer's natural height (`scene.h || 1080`), and tag the node `data-xlayer={scene.id}`.
   Otherwise behave as before (camera on the DOM, for the live player).
2. **`Walkthrough` render** — compute the stage-space cursor (`csx,csy`) and pulse position
   **outside** the JSX, then publish a per-frame recipe and skip the DOM `<Cursor>`/`<ClickPulse>`
   when flat (the canvas draws them):
   ```js
   const FLAT = !!window.__OD_FLATCAM;
   window.__odFrame = {
     inIntro,
     layers: [/* { id, h, s, tx, ty, opacity } per visible scene (active + crossfade) */],
     cursor: inIntro ? null : { x: csx, y: csy, press },
     pulse:  (!inIntro && pulse != null) ? { x: pulseX, y: pulseY, p: pulse } : null,
   };
   ```
   Pass `flat={FLAT}` to both SceneLayers.
3. **Exporter `run()`** — set `window.__OD_FLATCAM = true` before warming up.
4. **`captureComposited(node, fontCSS)`** replaces every `htmlToImage.toBlob(node, opts)` call.
   For each layer: `htmlToImage.toCanvas(el, { width:1920, height:ly.h, pixelRatio: SS=2,
   fontEmbedCSS, style:{ transform:'none', opacity:'1' } })`, then
   `ctx.setTransform(ly.s/SS, 0, 0, ly.s/SS, ly.tx, ly.ty); ctx.drawImage(big, 0, 0)`. Fill the
   background (`#fbfaf9`) first; after the layers reset the transform and draw the pulse (stroked
   arc) and cursor (a `Path2D` filled white + stroked dark, scaled `32/24 * (press ? 0.82 : 1)`).
5. **Intro frames** still use the old whole-tree capture (an `introOpts` with `backgroundColor`).
Notes: variable-height screens (tall forms, `scene.h > 1080`) work automatically because the
recipe carries `ly.h`. If a video anchors the pulse at the click location rather than the live
cursor, publish `pulse:{ x:pulseAt.x, y:pulseAt.y, p:pulse }`. This makes the older
"clear finished ripple rows' inline transform" note moot for zoom jitter, but keep that cleanup
anyway — it still matters for rows that animate while the camera is static.

## Cursor lands on the wrong element in the EXPORT only — `margin:auto` reflow
**Symptom:** the live preview is perfect, but in the exported PNG sequence the whole page
content (and therefore the follow-cursor relative to it) is shifted sideways — typically a few
hundred px to one side — so the cursor lands on the *neighbouring* element (e.g. it's authored
under the "1.1" version field but the PNG shows it over the "Increase major number" button). The
shift is consistent across every frame of the affected scene and only appears on disk.
**Do NOT chase the cursor coordinate.** The cursor math is fine. The bug is that
**`html-to-image` rasterizes through an SVG `<foreignObject>`, and that path drops horizontal
`margin: 0 auto` centering** — any block centered with auto-margins (here `.form-wrap`, the form
column) snaps to the left of its container in the capture, sliding all its content over. The
follow-cursor is positioned from the *live* DOM's measured coords (correct), but the captured
bitmap has the form in a different place, so they disagree. Browser-level `cloneNode` does NOT
reproduce this — only the foreignObject render does — which is why a naive clone test looks clean.
**Fix:** center with **flex on the container instead of auto-margins on the child**, which the
foreignObject preserves. Scope it so table/non-form screens are untouched:
```css
.content-inner:has(> .form-wrap) { display: flex; flex-direction: column; align-items: center; }
.form-wrap { width: 100%; max-width: 64rem; margin: 0; }   /* was: margin: 0 auto */
```
This is purely visual-neutral in the live browser (same centered result) but makes the **exported
frame match the preview**. Generalise: avoid relying on `margin:auto` (or any other property the
foreignObject path mishandles) for anything whose horizontal position the cursor/camera targets.
**How to verify WITHOUT a slow full-frame raster** (the in-app tools can't rasterize a
1920×2380 layer in time): call `htmlToImage.toSvg(layer, {width, height, skipFonts:true})`,
decode the returned data-URL to markup, inject it into an offscreen `<div>`, and
`getBoundingClientRect` the elements inside the live `<foreignObject>`. That measures the *capture*
layout (not the live DOM) in milliseconds, so you can confirm an element sits where the live page
puts it — and confirm a CSS fix — before bundling. This same probe is how the `margin:auto` shift
was found and the flex fix validated.

## Environment gotchas
- The in-app preview **caches `.jsx`/`.js` aggressively** and **strips large inline `<script>`**.
  After editing engine/scenes, hard-reload before trusting what you see; the storyboard/exporter
  fetch JSON at runtime to dodge inline-script stripping.
- html-to-image **can't capture inside the in-app preview** (font fetch blocked) — exporters must
  run locally. Inlining fonts also avoids a per-frame font-embed hang.
- **Standalone exporters are frozen snapshots.** Each `part*-export-standalone.html` inlines a
  copy of `app.css` / engine / scenes / screens at bundle time. After fixing anything *shared*
  (e.g. `app.css`, `anim-engine.jsx`), the fix does NOT reach an already-bundled standalone —
  **re-bundle every part's standalone**, not just the one you tested, or the user runs stale files.
- **Freshness canary, used correctly.** When a user reports "still broken," rule out a stale
  download before re-investigating: temporarily set an obvious background colour in the exporter
  and bundle. But **change the colour each iteration** (red → green → blue) — reusing one colour
  can't distinguish build N from build N-1 (this caused real confusion: an early red build had the
  *old* cursor, so "I see red" wrongly looked like the latest). Remove the canary once confirmed.
- When animating two near-identical frames across a cut (the "invisible crossfade" trick), keep
  the crossfade short (~0.2–0.3s) and the content truly identical at the cut, or the dissolve
  shows.
