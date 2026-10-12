# Portfolio Website: Design

Date: 2026-10-12
Owner: Yassine Chouk (student at INSAT, Tunisia)
Repo: `yassinechouk/portfolio`
Status: Draft for review

## 1. Purpose and success criteria

A personal portfolio whose main goal is **internships and jobs** in **embedded / IoT / systems**. Recruiters and engineers skim it, so the content must be easy to reach even though the site is built around a 3D scene.

Success means:
- A visitor can find About, Skills, Projects and Contact within seconds, without needing the 3D scene.
- The 3D scene is memorable and fits the field: a single microcontroller (MCU) chip, with no surrounding board.
- It loads fast, works on mobile, and degrades gracefully (no WebGL, reduced motion).
- The repo is clean enough to explain in an interview.
- It deploys automatically to GitHub Pages.

## 2. Decisions made

| Topic | Decision |
|---|---|
| Audience / goal | Internships and jobs |
| Field | Embedded / IoT / systems |
| Theme | One microcontroller chip as the hero object (no PCB board) |
| Interaction | Scroll-driven camera tour; scroll is the only required input |
| Approach | Procedural chip built in code, with native page scroll over a fixed canvas |
| Stack | React, TypeScript, Three.js via react-three-fiber (and drei), Vite |
| Hosting | GitHub Pages, deployed by GitHub Actions |
| Projects | 3–6 projects with details |

## 3. Architecture

Two layers:
1. A fixed full-screen `<Canvas>` (the scene) behind everything.
2. A normal scrolling HTML page (the content) in front.

The only link between them is one **scroll progress** value from 0 to 1. The sections publish their scroll position; the scene reads that value to move the camera and animate the chip. The scene never owns content, and the content never imports Three.js.

If WebGL is unavailable, the device is weak, or the visitor prefers reduced motion, the canvas is replaced by a static chip image. The page works unchanged.

### Project structure (Vite + React + TypeScript)

```
portfolio/
├─ docs/superpowers/specs/      design docs
├─ public/                      favicon, static chip fallback image, CV pdf
├─ src/
│  ├─ main.tsx, App.tsx         app shell, layout
│  ├─ content/                  all text as typed data: about, skills, projects, contact
│  ├─ sections/                 Hero, About, Skills, Projects, Contact (plain HTML/CSS)
│  ├─ scene/
│  │  ├─ Scene.tsx              <Canvas>, lights, post-effects
│  │  ├─ chip/                  Package, Pins, Die, Traces (procedural parts)
│  │  ├─ cameraPath.ts          scroll progress to camera waypoints, one per section
│  │  └─ shaders/               signal-pulse and glow shaders
│  ├─ hooks/                    useScrollProgress, useReducedMotion, useWebGLSupport
│  └─ styles/                   tokens (colors, type), global CSS
└─ .github/workflows/deploy.yml GitHub Pages deploy
```

### Boundaries
- `content/` is the only place to edit text or add a project.
- `sections/` never imports from `scene/`.
- `cameraPath.ts` is the only file that maps sections to camera positions.

## 4. The scene and scroll tour

### The chip
One hero microcontroller built in code:
- Dark package body with a pin-1 dot and an engraved label (`YASSINE CHOUK` and a fake part number).
- Pins on all four sides.
- A die, visible when the camera goes inside.
- Thin traces in one accent color, with small light pulses travelling along them like signals.
- Style: dark and technical, a single accent color, no photorealism.

### Camera stops (eased between as the user scrolls)

| Section | Camera | What happens |
|---|---|---|
| Hero | Far, slow orbit around the whole chip | Pulses idle; the name appears over it |
| About | Moves in toward the package label | The package fades slightly to hint at the inside |
| Skills | Dives to the die, whose blocks look like a CPU core, memory and peripherals | Each block is a skill group, highlighted when its list is shown |
| Projects | Slides along the pins, one pin per project | The active project's pin lights up and its signal pulses |
| Contact | Pulls back to the full chip | A final "boot" pulse, then the contact links |

### Interaction
- Scroll is the only required input.
- The mouse adds a small parallax tilt.
- The projects list has a non-3D way to pick a project, so nothing depends on hover.

### Performance and fallbacks
- Pixel ratio is capped, there is no heavy post-processing, and the scene pauses when the tab is hidden.
- On mobile the chip is simpler (fewer traces and pulses).
- With no WebGL or with reduced motion, the page shows a static chip image and the same sections.

## 5. Content (in `src/content/`)

- **About:** short intro (INSAT student, embedded / IoT / systems focus, what Yassine is looking for), plus links to CV, GitHub and LinkedIn.
- **Skills:** grouped to match the die blocks, for example Languages (C, C++, Python), MCUs and platforms, Protocols (I2C, SPI, UART, CAN), and Tools (RTOS, Git, debugging, CAD). Placeholders until Yassine supplies the real list.
- **Projects:** 3–6 entries, each with title, one-line summary, stack tags, role, image or demo, and GitHub link. Each has a card and a detail view.
- **Contact:** email, LinkedIn, GitHub and a downloadable CV. No backend form (static site); a `mailto:` link is used.

## 6. Visual style

- Dark background and one accent color (PCB green or electric cyan, to be chosen).
- Monospace font for labels and headings, clean sans-serif for body text.
- Semi-transparent panels keep text readable over the 3D background.
- Sticky nav highlights the current section.
- Colors and type are defined as tokens in `styles/`.

## 7. Quality and robustness

- **Accessibility:** semantic HTML, keyboard navigation, alt text, respect for reduced motion, sufficient contrast.
- **SEO:** page title, description and Open Graph tags so shared links look good.
- **Errors:** an error boundary around the canvas shows the static fallback instead of a blank page.

## 8. Testing

Kept proportionate to a portfolio site:
- Unit tests for pure logic: `cameraPath` (scroll progress to camera position) and content validation.
- A Playwright smoke test: the page loads, each section is reachable, and the fallback appears with WebGL disabled.
- Lint, type-check and build run on every push.

## 9. Deployment

A GitHub Actions workflow builds with Vite and publishes to GitHub Pages. The Vite `base` is `/portfolio/` and changes if a custom domain is added.

## 10. Out of scope for v1

Blog, CMS, backend contact form, multiple languages, and a Blender-authored model. The procedural chip can be swapped for a `.glb` later without touching the sections.

## 11. Open items for the implementation plan

- Accent color choice (PCB green or electric cyan).
- Real skills list, project details, CV file and profile links from Yassine.
- Whether a custom domain will be added (affects the Vite `base`).
