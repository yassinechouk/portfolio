# Portfolio

A scroll-driven portfolio for an embedded / IoT / systems engineer. A 3D microcontroller chip (package, pins, die, traces) sits behind the page and the camera moves to a new stop as you scroll through the sections: hero, about, skills, projects and contact. Skills light up die blocks and projects light up pins.

Stack: Vite, React 19, TypeScript, three.js via React Three Fiber and drei, Vitest + Testing Library, Playwright, oxlint.

Live site: https://yassinechouk.github.io/portfolio/

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then production build into `dist/` |
| `npm run preview` | Serve the built site |
| `npm run lint` | oxlint |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Unit and component tests (Vitest) |
| `npm run test:e2e` | Playwright end-to-end tests (builds and previews on port 4173) |

## Project structure

```
src/
  content/   all editable text, skills, projects (+ validation, asset URL helper)
  hooks/     scroll progress, reduced motion, WebGL support
  scene/     3D layer: Scene, SceneHost, error boundary, static fallback
    chip/    chip geometry, package, pins, die, traces
    shaders/ trace pulse shader
  sections/  Nav, Hero, About, Skills, Projects, Contact
  state/     tourStore, the shared channel between sections and scene
  styles/    tokens.css (design tokens), global.css
e2e/         Playwright specs
public/      cv.pdf, favicon, og-image, chip-fallback.png
```

## Editing content

Edit only `src/content/index.ts`: name, headline, bio, links, skill groups and projects. Content is validated by `src/content/validate.ts`, so mistakes fail the tests.

- CV: replace `public/cv.pdf` (keep the filename, or change `links.cv`).
- Images: use paths relative to the site root, for example `images/foo.png` for `public/images/foo.png`. They are resolved against the deploy base path by `src/content/assetUrl.ts`. Absolute `https:` URLs are left untouched.

## Changing the accent color

These places carry the colour and must match:

1. `--accent` in `src/styles/tokens.css` (all CSS derives from it, including tints via `color-mix`)
2. `ACCENT` in `src/scene/chip/geometry.ts` (the 3D scene reads this constant)
3. `public/favicon.svg` (the colour is hard-coded as `#00e5ff` in the SVG)
4. `public/og-image.png` (a raster image; regenerate it)

`theme-color` in `index.html` is the page background (`#05080d`), not the accent, so it does not change with the accent.

Default is `#00e5ff`.

## Fallbacks

The 3D layer degrades gracefully. With no WebGL, a lost WebGL context, or a render error (caught by the error boundary), the page shows a static chip image (`public/chip-fallback.png`). With `prefers-reduced-motion`, the static image is shown instead of the animated scene. The content stays fully usable in every case.

## Testing

- Unit and component tests live next to the code (`*.test.ts(x)`) and run with `npm test`.
- End-to-end tests are in `e2e/`. `npm run test:e2e` builds, previews and runs them. Locally run `npx playwright install chromium` once. In sandboxes with a pre-installed Chromium, set `PW_CHROMIUM_PATH` to its executable instead.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, build and e2e on every push and pull request.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (or manually via "Run workflow"). One-time setup: in the repo go to Settings, Pages, and set Source to "GitHub Actions". The site is served at https://yassinechouk.github.io/portfolio/.

For a custom domain:

- Set `base: '/'` in `vite.config.ts` and configure the custom domain (CNAME) in the repo's Settings, Pages.
- Update `og:url` and `og:image` in `index.html`.
- `playwright.config.ts` and `e2e/smoke.spec.ts` hard-code `/portfolio/`; update them after any base change.
- The title, description and Open Graph text in `index.html` are personal text too; edit them for your own name and role.

## Before launch

- Replace every `TODO(owner)` marker in `src/content/index.ts` (`grep -rn "TODO(owner)" src/content`): headline, bio, GitHub and LinkedIn links, skills, projects. The deploy workflow refuses to build while any `TODO(owner)` remains in `src/content`, so the site will not publish until they are replaced.
- Replace the placeholder `public/cv.pdf` with your real CV.
- Decide on the accent color (see above).
- Update `og:url` / `og:image` in `index.html` if the final URL differs.
