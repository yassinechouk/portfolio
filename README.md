# Portfolio

A scroll-driven portfolio for Yassine Chouk, an embedded / IoT / systems engineer. A 3D microcontroller chip (package, pins, die, traces) sits behind the page and the camera moves to a new stop as you scroll through six sections:

1. **Hero** - name, headline, links to the projects and the CV.
2. **About** - bio, highlights, education, spoken languages and a profile photo slot (initials until a photo is added).
3. **Skills** - six skill groups; each group lights up a block of the die.
4. **Experience** - the two internships as a timeline, with outcomes and tags (an entry can optionally carry one picture).
5. **Projects** - two tiers. The two featured projects are big cards (two columns on desktop, stacked on phones) with one picture, a short description, measured-result chips, tags, a role line and a repository link; clicking the picture opens it in a lightbox (Escape or Close dismisses it). Under "More projects", the other two are compact rows with a title, one line, three tags and a link, and no picture. Whichever item is nearest the middle of the screen (or clicked or focused) is marked with an accent border, and it lights up a pin on the chip.
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
  state/     tourStore and themeStore, the shared channels between sections and scene
  styles/    tokens.css (design tokens per theme), global.css
e2e/         Playwright specs (smoke.spec.ts, profile.spec.ts, theme.spec.ts)
public/      cv.pdf, favicon, og-image, chip-fallback.png (dark), chip-fallback-light.png, projects/**, experience/
```

## Editing content

Edit only `src/content/index.ts` (types are in `src/content/types.ts`). Content is checked by `src/content/validate.ts`, so mistakes fail `npm test`.

- `about`: name, `role`, `affiliation`, `availability` (the badge), `headline`, `tagline`, the About `lead` and 1 to 4 `blocks` (`title` + `text`), `highlights`, `education`, `spokenLanguages`, `photo` and `links` (`cv`, `github`, `linkedin`).
- `skills`: exactly six groups with the ids `languages`, `platforms`, `firmware`, `protocols`, `tools`, `testing`; each needs at least one item. The ids map to die blocks, so do not rename them.
- `experience`: one entry per job with `role`, `organization`, `place`, `period`, `outcomes`, `tags`, optional `repoUrl` and optional `image` (`src`, `alt`, `caption`). Order is newest first.
- `projects`: 3 to 6 entries, each with `summary`, `tags`, `repoUrl` and optional `demoUrl`, in the order they appear. 1 to 3 of them set `featured: true`; the rest are compact rows.
  - A featured project has an optional `role` (shown as a `Role:` line), 2 to 4 `metrics` (the proof chips, short measured results) and exactly one `media` item (`src`, `alt`, `caption`), which is its picture.
  - A compact project has no `media` (`media: []`), ships `metrics: []` (compact rows do not show them) and no `role`. Keep its `summary` to one line and its `tags` to three.
- CV: replace `public/cv.pdf` (keep the filename, or change `about.links.cv`).

### Images

- Put them under `public/` (a featured project's picture in `public/projects/<project-id>/`, an optional experience image in `public/experience/`) and reference them by a path relative to `public/`, for example `projects/freertos-inspector/inspector.webp`. `src/content/assetUrl.ts` resolves the path against the deploy base. Absolute `https:` URLs are left untouched.
- Only featured projects carry a picture (relative `.webp` under `public/projects/<id>/`, about 150 KB at most); compact projects have none. An Experience entry may optionally carry an `image` too. A test fails if an image is shipped that no content entry uses.
- Every image needs descriptive `alt` text and a `caption` (validation rejects empty ones).

### Profile photo

Add the file as `public/profile.jpg` and set `photo: 'profile.jpg'` in `about` in `src/content/index.ts`. Until then (or if the file fails to load) the About section shows the initials.

### Contact form (Web3Forms)

1. Create a free access key for `yassine.chouk@insat.ucar.tn` at https://web3forms.com.
2. Paste it into `contact.form.accessKey` in `src/content/index.ts`.
3. Run `npm run test:e2e` locally once: the contact e2e switches to the mocked real-form branch automatically.

Until a real key is set, the Contact section shows an `Email me` button instead of the form, and the deploy workflow refuses to publish because the placeholder carries a `TODO(owner)` marker. The key is a public identifier by design (Web3Forms keys are meant for client-side use).

## Theme

The site always opens in the **light** theme, whatever the visitor's system preference. The sun/moon button at the end of the nav switches to the dark theme (and back) for the current visit only: the choice lives in memory (`src/state/themeStore.ts`), nothing is written to cookies or web storage, and a reload opens light again.

- `index.html` ships `<html data-theme="light">` and the light `theme-color`, so there is no flash. `src/main.tsx` calls `startThemeSync()`, which keeps `data-theme` and the `theme-color` meta in step with the store.
- CSS colours live only in `src/styles/tokens.css`: a shared `:root` block (fonts, radius, spacing), a light block (`:root, :root[data-theme='light']`) and a dark block (`:root[data-theme='dark']`). Every colour in `global.css` is a `var(--token)` (or a `color-mix` of one); a test fails on any raw colour outside `tokens.css`, on a token missing from either theme, or on a text pair under 4.5:1 (graphics under 3:1).
- The 3D scene takes its colours from `src/scene/chip/palette.ts` (`scenePalette(theme)`): package, pins, die blocks, traces, label and lights for each theme. The scene reads the theme from the store and updates its materials in place; the camera path and the package fade are the same in both themes.
- Page backgrounds are in `THEME_BACKGROUND` in `src/state/themeStore.ts` (the `theme-color` value); a test keeps them equal to `--bg` in `tokens.css`.
- Images per theme: the static fallback is `public/chip-fallback-light.png` in light and `public/chip-fallback.png` in dark (both are screenshots of the real scene at the hero stop); `public/og-image.png` (the link preview) shows the light chip.

## Changing the accent color

These places carry the colour and must match:

1. `--accent` in `src/styles/tokens.css`, once per theme (all CSS derives from it, including tints via `color-mix`). Light is a deep teal (`#006d79`, readable on white), dark is cyan (`#00e5ff`).
2. The accent-derived scene colours (traces, lit pin, die edges and glow, rim light) for each theme in `src/scene/chip/palette.ts` (`DARK_ACCENT` / `LIGHT_ACCENT`); a test checks that each one keeps 3:1 against the surface it is drawn on.
3. `public/favicon.svg` (cyan `#00e5ff` on a dark square, which reads on light and dark tabs alike; hard-coded in the SVG)
4. `public/og-image.png` (a raster image of the light theme; regenerate it)

`theme-color` in `index.html` is the light page background (`#f4f6f8`), not the accent; the store switches it to `#05080d` in dark.

## Fallbacks

The 3D layer degrades gracefully. With no WebGL, a lost WebGL context, or a render error (caught by the error boundary), the page shows a static chip image (`public/chip-fallback-light.png`, or `public/chip-fallback.png` in the dark theme). With `prefers-reduced-motion`, the static image is shown instead of the animated scene. The content stays fully usable in every case.

## Testing

- Unit and component tests live next to the code (`*.test.ts(x)`) and run with `npm test`.
- End-to-end tests are in `e2e/`: `smoke.spec.ts` (meta tags, nav, fallbacks), `profile.spec.ts` (experience, images and CV served as the right types, contact links, 375 px overflow, contact form, lightbox) and `theme.spec.ts` (light by default even with a dark OS preference, the toggle, `theme-color`, the fallback per theme, the toggle fitting at 375 px, nothing stored). `npm run test:e2e` builds, previews and runs them. Locally run `npx playwright install chromium` once. In sandboxes with a pre-installed Chromium, set `PW_CHROMIUM_PATH` to its executable instead.

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

- [ ] Resolve every `TODO(owner)` marker in `src/content/index.ts` (`grep -rn "TODO(owner)" src/content`): the Web3Forms `accessKey`. The deploy workflow refuses to build while any remains in `src/content`.
- [ ] After pasting the Web3Forms key, run `npm run test:e2e` locally once: the contact e2e switches to the mocked real-form branch automatically.
- [ ] Add the profile photo (`public/profile.jpg`, `about.photo`).
- [ ] Make the repository public (or choose another host).
- [ ] Decide on the accent colours and the light/dark palettes (see Theme and Changing the accent color).
- [ ] Update `og:url` / `og:image` in `index.html` if the final URL differs.
