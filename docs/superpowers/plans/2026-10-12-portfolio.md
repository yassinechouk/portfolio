# Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a scroll-driven 3D microcontroller-chip portfolio (About, Skills, Projects, Contact) on GitHub Pages.

**Architecture:** A fixed react-three-fiber `<Canvas>` sits behind normal scrolling HTML sections. The two layers never import each other; they communicate only through a small `tourStore` (scroll progress, active section, active project, active skill group). The scene reads it to move the camera and light the chip; the sections write it.

**Tech Stack:** Node 20+, npm, Vite, React, TypeScript, three, @react-three/fiber, @react-three/drei, Vitest + Testing Library (jsdom), Playwright, ESLint, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-10-12-portfolio-design.md`

## Global Constraints

- Vite `base` is `/portfolio/`; every asset URL (CV, fallback image) is built from `import.meta.env.BASE_URL`.
- `src/content/` is the only place text or projects are edited. `src/sections/` never imports from `src/scene/`, and `src/scene/` never imports from `src/sections/`.
- `src/scene/cameraPath.ts` is the only file mapping sections to camera positions.
- Scroll is the only required input; nothing may depend on hover. Mouse parallax is optional.
- No WebGL, a lost context, or `prefers-reduced-motion` shows a static chip image; the sections work unchanged.
- Dark background, one accent color (CSS token `--accent`, default `#00e5ff`, owner may change), monospace for labels/headings, sans-serif for body, tokens in `src/styles/`.
- Contact is a `mailto:` link plus CV download; no backend form.
- Page `<title>`, description and Open Graph tags are set. Semantic HTML, keyboard navigation, alt text.
- Projects: 3 to 6 entries. Pixel ratio capped (max 2); scene pauses when the tab is hidden; fewer traces and pulses on mobile.
- Lint, type-check, unit tests and build run on every push.
- Out of scope: blog, CMS, backend form, i18n, Blender model.

## Review Focus

- WebGL missing or context lost: the fallback shows and no section breaks (Task 7, Task 8).
- `prefers-reduced-motion: reduce`: no animated canvas, static image instead (Task 7).
- Project count outside 3 to 6, or a project with no image: validation rejects the count, and the card renders without an image (Task 2, Task 5).
- Scroll out of range, zero-height or reordered sections, resize: progress stays clamped to 0..1 and never NaN (Task 3, Task 4).
- Deployed under `/portfolio/`: the CV link and fallback image resolve with the base path (Task 5, Task 9).

---

### Task 1: Scaffold, tooling, app shell

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`, `.gitignore`, `src/main.tsx`, `src/App.tsx`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `App` default export rendering a `<main>`; npm scripts `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`.

- [ ] **Step 1:** The repo is not empty (`docs/`), so scaffold with `npm create vite@latest <tmpdir> -- --template react-ts` in a temp directory outside the repo, copy the files in, then `npm install`. Add deps: `three @react-three/fiber @react-three/drei`; dev deps: `vitest jsdom @testing-library/react @testing-library/jest-dom @types/three @playwright/test`.
- [ ] **Step 2:** Write failing test `renders a main landmark` in `src/App.test.tsx`: `render(<App />)`, assert `screen.getByRole('main')` is in the document.
- [ ] **Step 3:** Run `npx vitest run`. Expected: FAIL (no `main` role yet).
- [ ] **Step 4:** Configure `vite.config.ts` with `base: '/portfolio/'` and Vitest (`environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']`, which imports `@testing-library/jest-dom`). Make `App` render `<main />`. Add scripts: `typecheck` = `tsc -b --noEmit`, `test` = `vitest run`, `test:e2e` = `playwright test`.
- [ ] **Step 5:** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass.
- [ ] **Step 6:** Commit `chore: scaffold vite react ts with test tooling`.

### Task 2: Content model, validation, data

**Files:**
- Create: `src/content/types.ts`, `src/content/validate.ts`, `src/content/index.ts`
- Test: `src/content/validate.test.ts`

**Interfaces:**
- Produces:
  - `type Project = { id: string; title: string; summary: string; tags: string[]; role: string; image?: string; demoUrl?: string; repoUrl: string }`
  - `type SkillGroup = { id: 'languages' | 'platforms' | 'protocols' | 'tools'; label: string; items: string[] }`
  - `type Content = { about: { name: string; headline: string; bio: string; links: { cv: string; github: string; linkedin: string } }; skills: SkillGroup[]; projects: Project[]; contact: { email: string } }`
  - `validateContent(c: Content): string[]` (empty array means valid)
  - `content: Content` exported from `src/content/index.ts`, with placeholder text clearly marked `TODO(owner)`.

- [ ] **Step 1:** Write failing tests in `validate.test.ts`: `accepts valid content`; `rejects fewer than 3 projects`; `rejects more than 6 projects`; `rejects duplicate project ids`; `rejects non-https repoUrl`; `rejects an empty skill group`; `rejects an email without @`; `accepts a project with no image` (returns `[]`). Each rejection test asserts the returned array has length 1 and mentions the offending field.
- [ ] **Step 2:** Run `npx vitest run src/content`. Expected: FAIL.
- [ ] **Step 3:** Implement `validateContent` and the types. Add a test in `index.test.ts` asserting `validateContent(content)` equals `[]` for the shipped placeholder data (3 placeholder projects, 4 skill groups).
- [ ] **Step 4:** Run `npx vitest run src/content`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: typed content model with validation`.

### Task 3: Tour store, scroll math, hooks

**Files:**
- Create: `src/state/tourStore.ts`, `src/hooks/progressFromTops.ts`, `src/hooks/useScrollProgress.ts`, `src/hooks/useReducedMotion.ts`, `src/hooks/useWebGLSupport.ts`
- Test: `src/hooks/progressFromTops.test.ts`, `src/state/tourStore.test.ts`, `src/hooks/useReducedMotion.test.tsx`

**Interfaces:**
- Produces:
  - `type SectionId = 'hero' | 'about' | 'skills' | 'projects' | 'contact'` and `SECTION_ORDER: SectionId[]` exported from `src/state/tourStore.ts`
  - `type Tour = { progress: number; activeSection: SectionId; activeProjectId: string | null; activeSkillGroup: SkillGroup['id'] | null }`
  - `setTour(patch: Partial<Tour>): void`, `useTour<T>(select: (t: Tour) => T): T` (via `useSyncExternalStore`), `getTour(): Tour`
  - `progressFromTops(tops: number[], scrollY: number): number`: with section tops sorted ascending (one per section), returns 0..1 where each section boundary is an equal 1/(n-1) step, interpolating linearly inside a section; clamped; never NaN.
  - `useScrollProgress(sectionIds: SectionId[]): void`: on scroll/resize (rAF-throttled) measures the `#<id>` elements and calls `setTour({ progress, activeSection })`.
  - `useReducedMotion(): boolean`, `useWebGLSupport(): boolean`

- [ ] **Step 1:** Write failing tests for `progressFromTops` (tops `[0,100,300,400,700]`): `returns 0 at scrollY 0`; `returns 0.25 at the second section top`; `interpolates inside a section (scrollY 200 gives 0.375)`; `clamps below 0 and above the last top to [0,1]`; `returns 0 for zero-height or single-section input`; `never returns NaN for duplicate tops`.
- [ ] **Step 2:** Test `tourStore`: `setTour notifies subscribers`; `useTour only re-renders when the selected value changes`. Test `useReducedMotion`: stub `window.matchMedia` to match, assert `true`.
- [ ] **Step 3:** Run `npx vitest run src/hooks src/state`. Expected: FAIL.
- [ ] **Step 4:** Implement. `useWebGLSupport` tries `canvas.getContext('webgl2') ?? getContext('webgl')` once inside try/catch.
- [ ] **Step 5:** Run tests. Expected: PASS. Commit `feat: tour store, scroll math and capability hooks`.

### Task 4: Camera path

**Files:**
- Create: `src/scene/cameraPath.ts`
- Test: `src/scene/cameraPath.test.ts`

**Interfaces:**
- Consumes: `SectionId`, `SECTION_ORDER` from `src/state/tourStore.ts`.
- Produces:
  - `type Vec3 = [number, number, number]`, `type CameraPose = { position: Vec3; target: Vec3 }`
  - `waypoints: Record<SectionId, CameraPose>` (hero far orbit start, about near the package label, skills at the die, projects along the pin row, contact pulled back)
  - `poseAt(progress: number): CameraPose`: progress 0..1 maps to waypoint indexes `0..4`, smoothstep-eased interpolation between neighbours; clamped; non-finite input returns the hero pose.

- [ ] **Step 1:** Write failing tests: `poseAt(0) equals the hero waypoint`; `poseAt(1) equals the contact waypoint`; `poseAt(0.25) equals the about waypoint`; `poseAt(0.125) lies strictly between hero and about on every axis that differs`; `clamps -1 and 2`; `NaN returns the hero pose`.
- [ ] **Step 2:** Run `npx vitest run src/scene/cameraPath`. Expected: FAIL.
- [ ] **Step 3:** Implement with chosen waypoint numbers (tune visually in Task 6).
- [ ] **Step 4:** Run tests. Expected: PASS. Commit `feat: scroll-to-camera pose mapping`.

### Task 5: Styles and sections

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/sections/{Hero,About,Skills,Projects,Contact,Nav}.tsx`, `src/sections/ProjectCard.tsx`, `src/sections/ProjectDetail.tsx`
- Modify: `src/App.tsx`
- Test: `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `content` and types (Task 2), `setTour`, `useTour`, `SECTION_ORDER` (Task 3).
- Produces: each section is a `<section id="<SectionId>">` component taking no props and reading `content`; `Nav` highlights `useTour(t => t.activeSection)`. `Skills` sets `activeSkillGroup` on focus/click/scroll-into-view of a group; `Projects` renders a keyboard-operable list (buttons) that sets `activeProjectId`, and opens `ProjectDetail`. `App` calls `useScrollProgress(SECTION_ORDER)`.

- [ ] **Step 1:** Write failing tests: `renders all five sections with ids hero, about, skills, projects, contact`; `nav marks the active section with aria-current`; `selecting a project by keyboard sets activeProjectId and shows its detail`; `a project without an image renders its card without an img element`; `the CV link href starts with import.meta.env.BASE_URL`; `contact shows a mailto link`.
- [ ] **Step 2:** Run `npx vitest run src/sections`. Expected: FAIL.
- [ ] **Step 3:** Implement with semantic HTML (`nav`, `section` with headings, `ul`), semi-transparent panels, tokens for color and type (`--accent`, `--bg`, `--text`, `--font-mono`, `--font-sans`). Respect `prefers-reduced-motion` in CSS transitions.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test`. Expected: pass.
- [ ] **Step 5:** Commit `feat: content sections, nav and styles`.

### Task 6: Procedural chip and scene

**Files:**
- Create: `src/scene/chip/geometry.ts`, `src/scene/chip/{Package,Pins,Die,Traces}.tsx`, `src/scene/chip/Chip.tsx`, `src/scene/shaders/pulse.ts`, `src/scene/Scene.tsx`, `src/scene/useCameraRig.ts`
- Test: `src/scene/chip/geometry.test.ts`

**Interfaces:**
- Consumes: `poseAt` (Task 4), `useTour` (Task 3), `content.projects`, `content.skills`.
- Produces:
  - `pinPositions(pinsPerSide: number, bodySize: number, pinLength: number): Vec3[]` (four sides, evenly spaced, pins outside the body edge)
  - `pinIndexForProject(projectIndex: number, projectCount: number, pinCount: number): number` (spreads projects evenly along the pin row; always in `[0, pinCount)`)
  - `dieBlocks: { groupId: SkillGroup['id']; position: Vec3; size: Vec3 }[]` (core, memory, peripherals, tools blocks)
  - `Scene` default export: `<Canvas dpr={[1, 2]} frameloop` paused when `document.hidden`>`, lights, `Chip`, and `useCameraRig` which eases the camera toward `poseAt(progress)` each frame.
  - `Chip` accepts `{ lite: boolean }`; `lite` reduces traces and pulses for mobile. Engraved label text is `YASSINE CHOUK` plus the fake part number `YC-MCU32`.

- [ ] **Step 1:** Write failing tests: `pinPositions returns 4 * pinsPerSide points`; `pins sit outside the body half-size`; `pinIndexForProject stays within range for 1 to 6 projects`; `pinIndexForProject is strictly increasing across projects`; `dieBlocks cover all four skill group ids exactly once`.
- [ ] **Step 2:** Run `npx vitest run src/scene/chip`. Expected: FAIL.
- [ ] **Step 3:** Implement `geometry.ts`, then the components from boxes, cylinders, `Text` from drei for the label, and a shader-material pulse that travels along traces (`uTime`, `uAccent`). The active pin and active die block (from `tourStore`) glow brighter.
- [ ] **Step 4:** Visual check, not automated: run `npm run dev`, scroll through all five stops, and adjust `waypoints` until each stop frames its target as described in the spec. Take a screenshot per stop with Playwright (Chromium at `/opt/pw-browsers`; do not run `playwright install`) to confirm.
- [ ] **Step 5:** Run `npm run lint && npm run typecheck && npm test`. Commit `feat: procedural mcu chip scene with scroll camera`.

### Task 7: Fallbacks, error boundary, scene host

**Files:**
- Create: `src/scene/SceneHost.tsx`, `src/scene/SceneErrorBoundary.tsx`, `src/scene/StaticChip.tsx`, `public/chip-fallback.png` (a screenshot of the hero stop from Task 6)
- Modify: `src/App.tsx`
- Test: `src/scene/SceneHost.test.tsx`

**Interfaces:**
- Consumes: `useWebGLSupport`, `useReducedMotion` (Task 3), `Scene` (Task 6).
- Produces: `SceneHost` renders the lazy-loaded `Scene` (`React.lazy`, so three.js is a separate chunk) only when WebGL is supported and motion is not reduced; otherwise `StaticChip` (an `<img>` using `import.meta.env.BASE_URL + 'chip-fallback.png'`, with alt text, as a fixed background). `SceneErrorBoundary` shows `StaticChip` if the scene throws or the WebGL context is lost (`webglcontextlost` event).

- [ ] **Step 1:** Write failing tests (mock `Scene` with a stub): `shows the static chip when WebGL is unsupported`; `shows the static chip when reduced motion is preferred`; `shows the static chip when the scene throws`; `shows the scene when supported and motion allowed`; `the static chip src starts with the base URL`.
- [ ] **Step 2:** Run `npx vitest run src/scene/SceneHost`. Expected: FAIL.
- [ ] **Step 3:** Implement, and render `SceneHost` once in `App` behind the sections (fixed, `pointer-events: none`, `aria-hidden`).
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: pass, with a separate scene chunk in the build output.
- [ ] **Step 5:** Commit `feat: webgl and reduced-motion fallback with error boundary`.

### Task 8: SEO, accessibility, end-to-end smoke

**Files:**
- Modify: `index.html`
- Create: `playwright.config.ts`, `e2e/smoke.spec.ts`, `public/og-image.png`

**Interfaces:**
- Consumes: section ids from Task 5, fallback from Task 7.
- Produces: `npm run test:e2e` running against `vite preview` at `/portfolio/`.

- [ ] **Step 1:** Write failing e2e tests in `e2e/smoke.spec.ts`: `loads with the page title and meta description set`; `has Open Graph title, description and image tags`; `each nav link scrolls its section into view`; `with WebGL disabled the static chip image is visible and every section is still reachable` (launch Chromium with `--disable-gpu --disable-webgl`); `with reduced motion emulated no canvas element exists`; `the CV link responds with 200 under /portfolio/`.
- [ ] **Step 2:** Run `npm run build && npx playwright test`. Expected: FAIL (meta tags missing).
- [ ] **Step 3:** Add title, description, Open Graph and theme-color tags to `index.html`; set `lang="en"`; configure Playwright `webServer` to `npm run preview` and `baseURL` to `http://localhost:4173/portfolio/`; use Chromium via `PLAYWRIGHT_BROWSERS_PATH`.
- [ ] **Step 4:** Run `npx playwright test`. Expected: PASS.
- [ ] **Step 5:** Commit `feat: seo metadata and e2e smoke tests`.

### Task 9: CI and GitHub Pages deploy

**Files:**
- Create: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `README.md`

**Interfaces:**
- Consumes: npm scripts from Task 1 and `test:e2e` from Task 8.
- Produces: CI (`push`, `pull_request`): `npm ci`, `lint`, `typecheck`, `test`, `build`, then `test:e2e` after `npx playwright install --with-deps chromium`. Deploy (push to `main`): build, `actions/upload-pages-artifact`, `actions/deploy-pages`, with `pages: write` and `id-token: write` permissions.

- [ ] **Step 1:** Write the two workflows. Pin action major versions that exist today and check them against each action's latest release before committing.
- [ ] **Step 2:** Write `README.md`: what the project is, scripts, how to edit `src/content/`, how to change `--accent`, how to set the Vite `base` for a custom domain.
- [ ] **Step 3:** Validate locally with `npm ci && npm run lint && npm run typecheck && npm test && npm run build && npm run test:e2e`. Expected: all pass.
- [ ] **Step 4:** Commit `ci: add checks and github pages deploy`. After merging to `main`, the owner enables Pages with "GitHub Actions" as the source in the repo settings and confirms the site at `https://yassinechouk.github.io/portfolio/`.

---

## Self-review notes

- **Spec coverage:** architecture and structure (Tasks 1, 3, 5, 6); chip and camera stops (Tasks 4, 6); content and style (Tasks 2, 5); fallbacks and error boundary (Task 7); SEO, accessibility, testing (Tasks 5, 8); deploy (Task 9). Out-of-scope items are not planned.
- **Refinement of the spec:** the spec said the page sections publish their scroll position and the scene reads it, with no shared module. This plan adds `src/state/tourStore.ts` as the single shared channel so neither side imports the other. It also carries the active project and skill group that the pin and die highlights need.
- **Owner inputs still needed before launch:** real skills, projects, CV, links, accent color choice (default `#00e5ff`), and the custom-domain decision. The shipped data is placeholder text marked `TODO(owner)`.
