# AGENTS.md — guide for AI assistants working on this repo

Website for **Studio Jabbari (استودیو جباری)**, an architecture & interior design studio in Urmia, Iran.
Persian only, RTL, static front-end. No framework, no build step, no images.

## Run

Open `index.html` in a browser, or `npx serve .` and visit the printed URL.
Test at desktop width and at 375px (phone). The page must never scroll horizontally.

## File map and load order

Plain classic scripts sharing one global scope. **Order matters** (see `index.html`):

1. `assets/js/content.js`: `F` (all site content) and `LOGO` (messenger icon SVG paths)
2. `assets/js/engine.js`: helpers (`$`, `fa`, `clamp`, `mod`, `ease`, `rng`), the `Iso` canvas class, sculptural forms (`twistTower`, `shell`, `canopy`, `terraces`)
3. `assets/js/scenes.js`: `sceneHero()` (city), `SVC` (five service scenes), `towerCrane`, furniture helpers, `ART` (the black "area" card animation)
4. `assets/js/main.js`: renders `F` into the DOM, creates scenes, scroll and reveal logic, header state

Styles live in `assets/css/style.css`. The markup in `index.html` holds empty containers that `main.js` fills.

## Editing content

All copy and data is in `F` in `content.js`. Change content there, not in the HTML.
Use Persian digits in visible text (`fa()` converts numbers). Placeholders still to be replaced are listed in `README.md`.

## Design rules (agreed with the client; keep them)

- **Newspaper alignment:** one 12-column grid (`.g`), every text block starts on the same right edge. Paragraphs are justified (`.just`), except short quotes.
- **Negative space:** large section padding; each section owns about one screen (`.sec`), opened by a head with no rule line (`.shd`: name on the right, `۰۱ / ۰۵` index on the left). Do not draw lines on headings (no border on `.shd`, no dash before the hero kicker).
- **Typography:** Vazirmatn only (weights 100/300/400/500). Moderate sizes; do not make headings huge. Grey thin text (`.mute`) is the only accent device in headings.
- **Colors:** tokens in `:root` of `style.css`. Light paper sections alternate with full-black sections for rhythm: `.sec.dk` (about, projects) redefines the same tokens inverted, so components need no dark variants. Dark ink footer. One accent `--blue`, used rarely.
- **Header:** calm (brand, 4 nav links, "تماس"). Turns dark over `[data-dark]` elements: the dark sections and the footer. Do not mark smaller dark boxes (the record band) with `data-dark`. Solid background without backdrop blur (blur over the animated canvas costs frames).
- **Messenger icons:** monochrome line icons in circles that invert on hover. Never brand colors.
- **Isometric visuals:** monochrome "white model" style; transparent canvas background (same as page). Isometrics appear in the hero city and in services only.

### The client explicitly rejected (do not bring back)

Avatars or photo placeholders for the team; Noto Naskh or any second display font; colorful app icons; copy buttons; coordinates shown on the page; office hours; a "process" section; an FAQ; isometric images for projects (projects are a typography-only list); arrows on record cards; illustrations in the record stats (typography only, the dark band keeps its plan animation); a project-type bar chart; a long, spread-out "about" (keep it compact in one block); people or benches in the architecture service scene; Zaha-style sculptural towers in the hero city (the city uses simple, clean boxes).

## Isometric engine (`engine.js`)

`new Iso(hostElement, scene)` draws a scene into a canvas that fills `hostElement`.

A scene is a plain object:

```js
{
  fit:{x0,y0,x1,y1,z},   // world box to frame (iso projection)
  cover:false,           // true = fill the host (crop); false = contain
  zoom:1, pad:.06, dpr:1.75,
  topo:false,            // true = order static items by exact 3D overlap (needs a bounding box on every queued item)
  topoLive:false,        // same exact ordering for the moving layer (used by the area plan and the architecture scene)
  static(v){ ... },      // drawn once per resize, cached
  live(v,t){ ... }       // drawn every frame while visible; t = seconds
}
```

Inside `static` and `live`, queue drawables with `v.add(k, fn, bb)`: `k` is a depth key (larger `x+y` is nearer the viewer) and `bb` an optional world bounding box `[x0,y0,z0,x1,y1,z1]`.

**Occlusion (why cars never pop in front of buildings):** the static layer is cached once. Each frame, every moving item is drawn over the cache, then every static item whose `bb` is in front of it (`inFront(s,d)`, separating-axis test for the +x,+y,+z view) is redrawn, clipped to the moving item's screen box. So **always give moving things and anything that can stand in front of them a `bb`**. `box`, `tree`, `cypress`, `person`, `vehicle`, `twistTower`, `terraces` add one automatically; custom `v.add` calls must pass it. Flat floor effects (sunlight, ripples) use a thin `bb` at their height so furniture is redrawn over them. Shadows that a redraw must not repeat check `v.redraw`.

Main primitives:

- `v.box({x,y,z,w,d,h, win:[floorH,gap,winW,winH], wz, vl, vlz, fl, flz, shop:[z0,z1], ghost, st, top, rt, fr, lw, k})`
- `v.cyl(x,y,z,r,h,{side,top})`, `v.shadows(boxes)` (ground shadows, light from the back right)
- `v.tree(x,y,scale)`, `v.cypress(x,y,scale)`
- `v.person(x,y,t,{h,col,dir:[dx,dy],z,still,sit,bag,umb,bike,hat,dog:[x,y],cart,ph})` (walking legs follow `dir`; `z` puts the person on a slab or scaffold)
- `v.vehicle(x,y,'x'|'y',dir,'car'|'taxi'|'moto'|'bus'|'truck'|'van',col)` with `col` one of `w d g s b`
- `v.ripples(cx,cy,R,t)`, `v.birds(t,x0,y0,z)`
- Low level: `v.P(x,y,z)` (project to screen), `v.poly`, `v.pline`, `v.rect`, `v.blob`, `v.ground`
- Forms: `twistTower(v,cx,cy,{n,fh,R,tw,taper,bulge,exp,step,lean,dome,z0,k})`, `terraces(v,cx,cy,R,levels,k)`

### Hero city (`sceneHero` in `scenes.js`)

A living neighbourhood, not a construction site: four-lane crossroads with traffic lights (`lightState(t)`, 33 s cycle with all-red gaps), cars that accelerate, brake, queue and stop at the stop lines (right-hand traffic), pedestrians who wait at crosswalks and only start crossing when they can finish (`pedMayCross`), cyclists, dog walkers, a café with umbrellas, a bus stop, and a park with fountain, joggers, benches, playground and pigeons. Buildings are simple boxes with shopfronts, balconies, setbacks and rooftop tanks, AC units and greenery. The simulation was tested headless for 10 simulated minutes: no car collisions, no cars in the crossing at the same time from both roads, and no pedestrian inside a lane with a car.

**Performance rules** (the client cares about load speed): keep everything canvas-drawn, with no images. Put static geometry in `static` (cached), and only moving things in `live`. Scenes animate only while on screen (IntersectionObserver), and `prefers-reduced-motion` stops animation. The whole site is about 95 KB before fonts; keep it that way.

**Scrolling:** native browser scrolling, no smooth-scroll library and no scroll parallax. Nothing is measured inside scroll handlers: reveals (`.rv`), counters (`.cnt`) and the header colour use IntersectionObserver. Counters sit in `.cw` over an invisible copy of the final number, so their width never changes while counting.

## Responsive

Breakpoints: `960px` (stack columns) and `640px` (phone sizes). Check the record section (big numeral, list, dark band), the services visual (moves above the list), the team list and the footer at 375px.
