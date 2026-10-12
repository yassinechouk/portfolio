# Portfolio

A scroll-driven portfolio for Yassine Chouk, an embedded / IoT / systems engineer. A 3D microcontroller chip (package, pins, die, traces) sits behind the page and the camera moves to a new stop as you scroll through six sections:

1. **Hero** - name, headline, links to the projects and the CV.
2. **About** - bio, highlights, education, spoken languages and a profile photo slot (initials until a photo is added).
3. **Skills** - six skill groups; each group lights up a block of the die.
4. **Experience** - the two internships as a timeline, with outcomes, tags and an oscilloscope photo.
5. **Projects** - four project cards; the selected one shows its summary, measured-result chips, a gallery and links. Gallery images open in a lightbox (Escape or Close dismisses it). The active project lights up a pin.
6. **Contact** - email, phone, LinkedIn, GitHub, CV download and a query form.

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
  content/   all editable text, skills, experience, projects (+ types, validation, asset URL helper)
  hooks/     scroll progress, reduced motion, WebGL support
  scene/     3D layer: Scene, SceneHost, error boundary, static fallback
    chip/    chip geometry, package, pins, die, traces
    shaders/ trace pulse shader
  sections/  Nav, Hero, About, Skills, Experience, Projects, Contact (+ ContactForm, Lightbox)
  state/     tourStore, the shared channel between sections and scene
  styles/    tokens.css (design tokens), global.css
e2e/         Playwright specs (smoke.spec.ts, profile.spec.ts)
public/      cv.pdf, favicon, og-image, chip-fallback.png, projects/**, experience/
```

## Editing content

Edit only `src/content/index.ts` (types are in `src/content/types.ts`). Content is checked by `src/content/validate.ts`, so mistakes fail `npm test`.

- `about`: name, eyebrow, headline, tagline, bio `paragraphs`, `highlights`, `education`, `spokenLanguages`, `photo` and `links` (`cv`, `github`, `linkedin`).
- `skills`: exactly six groups with the ids `languages`, `platforms`, `firmware`, `protocols`, `tools`, `testing`; each needs at least one item. The ids map to die blocks, so do not rename them.
- `experience`: one entry per job with `role`, `organization`, `place`, `period`, `outcomes`, `tags`, optional `repoUrl` and optional `image` (`src`, `alt`, `caption`). Order is newest first.
- `projects`: 3 to 6 entries, each with `summary`, `tags`, `role`, `repoUrl` and optional `demoUrl`. `metrics` are the proof chips: 2 to 4 short measured results. `media` is up to 4 images, each with `src`, `alt` and `caption`; the first one is the card cover.
- CV: replace `public/cv.pdf` (keep the filename, or change `about.links.cv`).

### Images

- Put them under `public/` (project images in `public/projects/<project-id>/`, the experience image in `public/experience/`) and reference them by a path relative to `public/`, for example `projects/trackify/prototype.webp`. `src/content/assetUrl.ts` resolves the path against the deploy base. Absolute `https:` URLs are left untouched.
- Use `.webp`, at most 1200 px wide and about 150 KB each.
- Every image needs descriptive `alt` text and a `caption` (validation rejects empty ones).

### Profile photo

Add the file as `public/profile.jpg` and set `photo: 'profile.jpg'` in `about` in `src/content/index.ts`. Until then (or if the file fails to load) the About section shows the initials.

### Contact form (Web3Forms)

1. Create a free access key for `yassine.chouk@insat.ucar.tn` at https://web3forms.com.
2. Paste it into `contact.form.accessKey` in `src/content/index.ts`.
3. Run `npm run test:e2e` locally once: the contact e2e switches to the mocked real-form branch automatically.

Until a real key is set, the Contact section shows an `Email me` button instead of the form, and the deploy workflow refuses to publish because the placeholder carries a `TODO(owner)` marker. The key is a public identifier by design (Web3Forms keys are meant for client-side use).

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
- End-to-end tests are in `e2e/`: `smoke.spec.ts` (meta tags, nav, fallbacks) and `profile.spec.ts` (experience, images and CV served as the right types, contact links, 375 px overflow, contact form, lightbox). `npm run test:e2e` builds, previews and runs them. Locally run `npx playwright install chromium` once. In sandboxes with a pre-installed Chromium, set `PW_CHROMIUM_PATH` to its executable instead.

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, build and e2e on every push and pull request.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on every push to `main` (or manually via "Run workflow"). One-time setup: in the repo go to Settings, Pages, and set Source to "GitHub Actions". The site is served at https://yassinechouk.github.io/portfolio/.

GitHub Pages on a free plan needs the repository to be public. For a private repository, use another host that serves the `dist/` folder.

For a custom domain:

- Set `base: '/'` in `vite.config.ts` and configure the custom domain (CNAME) in the repo's Settings, Pages.
- Update `og:url` and `og:image` in `index.html`.
- `playwright.config.ts`, `e2e/smoke.spec.ts` and `e2e/profile.spec.ts` hard-code `/portfolio/`; update them after any base change.
- The title, description and Open Graph text in `index.html` are personal text too; edit them for your own name and role.

## Before launch

- [ ] Resolve every `TODO(owner)` marker in `src/content/index.ts` (`grep -rn "TODO(owner)" src/content`): the Trackify `role` (confirm it) and the Web3Forms `accessKey`. The deploy workflow refuses to build while any remains in `src/content`.
- [ ] After pasting the Web3Forms key, run `npm run test:e2e` locally once: the contact e2e switches to the mocked real-form branch automatically.
- [ ] Add the profile photo (`public/profile.jpg`, `about.photo`).
- [ ] Make the repository public (or choose another host).
- [ ] Decide on the accent color (see above).
- [ ] Confirm `public/projects/trackify/concept.webp` contains no real personal data.
- [ ] Update `og:url` / `og:image` in `index.html` if the final URL differs.
