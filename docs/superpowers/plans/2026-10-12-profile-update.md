# Profile Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the portfolio with the owner's real profile, a catchy About with a photo slot, a new Experience section (with its own camera stop), real projects with images and proof chips, and a working Web3Forms query form, while keeping the 3D chip tour.

**Architecture:** Same two layers as before: a fixed react-three-fiber scene behind HTML sections, linked only by `src/state/tourStore.ts`. This plan adds one section id (`experience`) and two die blocks on the scene side, and richer typed content (`src/content/`) plus new section components on the page side. All text and image paths stay in `src/content/`.

**Tech Stack:** unchanged (React, TypeScript, Vite, react-three-fiber/drei, Vitest + Testing Library, Playwright, oxlint). No new runtime dependency.

**Spec:** `docs/superpowers/specs/2026-10-12-profile-update-design.md` (extends `docs/superpowers/specs/2026-10-12-portfolio-design.md`)

## Global Constraints

- Everything in the base spec's Global Constraints still holds: Vite `base` is `/portfolio/` and every asset URL goes through `assetUrl`; `src/content/` is the only place text is edited; `src/sections/` never imports `src/scene/` and vice versa (the tour store is the only channel); scroll is the only required input; no WebGL / lost context / reduced motion shows the static chip; one accent colour via `--accent`; `useTour` selectors return primitives or stable references.
- Section order: Hero, About, Skills, Experience, Projects, Contact. Skill groups and die blocks: exactly six ids `languages`, `platforms`, `firmware`, `protocols`, `tools`, `testing`.
- Projects: 3 to 6 (shipping 4). Experience: at least 1 (shipping 2). Project `metrics`: 2 to 4. Project `media`: 0 to 4, first is the card cover.
- Real data: email `yassine.chouk@insat.ucar.tn`; phone `+216 21 691 995` (`tel:+21621691995`); LinkedIn `https://www.linkedin.com/in/yassine-chouk-8ba806312/`; GitHub `https://github.com/yassinechouk`.
- Copy: use the spec section 6 wording verbatim for Hero, About, Experience; project summaries and captions as written in this plan. No CAN-monitoring project.
- Form: Web3Forms JSON POST to `https://api.web3forms.com/submit`, 10 s timeout; message 10 to 2000 characters; the access key stays a `TODO(owner)` placeholder in content (the deploy gate refuses to ship it); with a placeholder key the form is replaced by an email-link button; no cookies or browser storage.
- Images: copied from the owner's repos under `/home/user/yassinechouk/<repo>/` (already cloned, read-only), resized to at most 1200 px wide, `.webp`, about 150 KB or less each, with alt text and caption.
- Dev loop in this sandbox: `npm run lint && npm run typecheck && npm test && npm run build`; e2e with `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run test:e2e`. vitest's `BASE_URL` is `/`; only e2e proves `/portfolio/`.

## Review Focus

- Six sections: progress to camera and package fade must stay correct when `SECTION_ORDER` has six entries (Task 2 tests derive stops from `SECTION_ORDER`).
- Form abuse and failure: double submit, timeout, network failure, server `success:false`, filled spam trap, key still a placeholder (Task 4).
- Photo slot: `about.photo` unset, or set to a file that 404s, must show the "YC" placeholder, never a broken image (Task 3).
- Narrow phone width: the six-link nav and the new two-column About/Contact must not overflow at 375px (Tasks 2, 3, 4 CSS; Task 6 e2e).
- Media: a project with 0 media renders no gallery; every media path exists on disk and loads under `/portfolio/`; lightbox closes on Escape and returns focus (Tasks 5, 6).

---

### Task 1: Content model, validation, real data

**Files:**
- Modify: `src/content/types.ts`, `src/content/validate.ts`, `src/content/index.ts`
- Modify (minimal compile fixes only, UI is redone in later tasks): `src/sections/About.tsx`, `src/sections/Contact.tsx`, `src/sections/Hero.tsx`, `src/sections/ProjectCard.tsx`, `src/sections/ProjectDetail.tsx`
- Test: `src/content/validate.test.ts`, `src/content/index.test.ts`, `src/sections/sections.test.tsx`

**Interfaces:**
- Produces (in `types.ts`):
  - `type Media = { src: string; alt: string; caption: string }`
  - `type Project = { id: string; title: string; summary: string; tags: string[]; role: string; metrics: string[]; media: Media[]; demoUrl?: string; repoUrl: string }` (`image` is removed)
  - `type SkillGroupId = 'languages' | 'platforms' | 'firmware' | 'protocols' | 'tools' | 'testing'`; `type SkillGroup = { id: SkillGroupId; label: string; items: string[] }`
  - `type ExperienceItem = { id: string; role: string; organization: string; place: string; period: string; outcomes: string[]; tags: string[]; repoUrl?: string; image?: Media }`
  - `type Content = { about: { name: string; eyebrow: string; headline: string; tagline: string; paragraphs: string[]; highlights: string[]; education: string; spokenLanguages: string[]; photo?: string; links: { cv: string; github: string; linkedin: string } }; skills: SkillGroup[]; experience: ExperienceItem[]; projects: Project[]; contact: { email: string; phone: string; form: { accessKey: string } } }`
  - `SkillGroup['id']` keeps working everywhere it is used (tour store, Die, Skills).
- `validateContent(c: Content): string[]` gains rules (message strings contain the quoted words): experience has at least 1 (`experience`); the skill ids are exactly the six, each once (`skills`); each project has 2 to 4 `metrics` (`metrics`); at most 4 `media` and every media has non-empty `alt` and `caption` (`media`); `contact.phone` matches `/^\+\d[\d ]{6,}$/` (`phone`); existing rules unchanged.
- Shipped `content` (real data, original wording; `eyebrow` = `Embedded · Real-time · Firmware`; headline, tagline, paragraphs, highlights from spec section 6; education `INSAT, Engineering degree in Industrial IT & Automation, 2023 to 2028 (expected)`; spokenLanguages `Arabic (native)`, `English (IELTS 7.0, C1)`, `French (C1)`, `German (ÖSD A2)`; `photo` unset; `cv: 'cv.pdf'`; `form.accessKey: 'TODO(owner): web3forms access key'`):
  - skills: languages `C, C++, Python`; platforms `STM32, ESP32-S3, TI C2000, Raspberry Pi`; firmware (label `RTOS & Firmware`) `FreeRTOS, Real-time scheduling, Bare-metal, Bootloaders, OTA updates, Interrupts, DMA, ADC / DAC, Timers, PWM`; protocols `UART, SPI, I2C, CAN, Wi-Fi`; tools `STM32CubeIDE, Code Composer Studio, ESP-IDF, Arduino IDE, Git, Linux`; testing (label `Testing`) `Hardware-in-the-loop (HIL), On-target debugging, Oscilloscope, Logic analyzer`.
  - experience (newest first): `qehna-lab` (Embedded control intern, `Qehna LAB (ENIT)`, `Tunis`, `Jun 2026`, tags `TI C2000`, `PWM`, `V/f control`, repo `https://github.com/yassinechouk/c2000-vf-motor-control`, outcomes per spec section 6) and `sagemcom` (Test automation intern, `Sagemcom`, `Ezzahra`, `Aug 2025`, tags `Python`, `Tkinter`, repo `https://github.com/yassinechouk/LOGCOMPARE`).
  - projects (newest first), all with `media: []` for now: `freertos-inspector` (title `FreeRTOS Inspector`, repo `https://github.com/yassinechouk/Freertos-inspector`, role `Author`, tags `STM32L476RG`, `FreeRTOS`, `ESP32-S3`, `DWT`, `UART`, metrics `13 tasks`, `0 deadline misses`, `47.8% CPU`, `5/5 injected faults caught in under 0.58 s`, summary: "A live timing analyser for FreeRTOS. It discovers every task by itself, measures response times on the target, and checks each deadline twice: by calculation and by measurement. Proven on a hardware-in-the-loop motor-control bench, including a fault lab that injects CPU hogs on purpose."); `ota-bootloader` (`Dual-slot OTA bootloader`, repo `https://github.com/yassinechouk/BOOTLOADER_OTA`, role `Author`, tags `STM32L476RG`, `Bare-metal C`, `ESP32-S3`, `UART`, `CRC32`, `IWDG`, metrics `3-layer verification`, `automatic rollback`, `43 host tests`, summary: "A firmware update system for the STM32L476RG, written bare-metal with no HAL and no RTOS. New images are verified three ways, installed in a spare flash slot and started on trial; if the application never confirms, the watchdog resets the board and the bootloader rolls back by itself. Updates arrive over UART or wirelessly through an ESP32-S3 Wi-Fi gateway."); `trackify` (`Trackify: fall-detection safety device`, repo `https://github.com/yassinechouk/smart-belt-alzheimer`, role `Embedded firmware & ML (team project)` with a `// TODO(owner): confirm role` comment, tags `ESP32-S3`, `MPU6050`, `SIM800L`, `NEO-6M GPS`, `Random Forest`, metrics `Random Forest on-device`, `Wi-Fi alerts + SMS fallback`, summary: "A wearable safety device for people with Alzheimer's. An ESP32-S3 reads motion from an MPU6050 and classifies idle, walking and falling with a Random Forest running on the device, then raises Wi-Fi cloud alerts with a GSM SMS fallback, alongside GPS tracking and an SOS button."); `aqua-genius` (`AQUA GENIUS: edge-ML irrigation`, repo `https://github.com/yassinechouk/AQUA_GENIUS_project`, role `Model training & ESP32-S3 firmware`, tags `ESP32-S3`, `XGBoost`, `C++`, `DS18B20`, metrics `under 10 ms inference`, `~400 KB flash`, `~1 KB RAM`, `bit-exact with Python`, summary: "A smart irrigation controller that decides on the device, not in the cloud. Two XGBoost models (pump on/off and water volume) are trained in Python and converted to plain C++ for an ESP32-S3, matching the Python output exactly. Telemetry and manual override go through a Blynk dashboard.").
  - contact: email, phone `+216 21 691 995`, form key placeholder.

- [ ] **Step 1: Write failing tests.** In `validate.test.ts` (using the existing `valid()`/`project()` factories, extended with the new required fields): `rejects empty experience` (length 1, mentions `experience`); `rejects a skill set that is missing an id` and `rejects a duplicated skill id` (mention `skills`); `rejects project metrics outside 2 to 4` (1 and 5 each give one error mentioning `metrics`); `rejects more than 4 media` and `rejects media with empty alt or caption` (mention `media`); `rejects a phone without a plus and digits` (mentions `phone`); `accepts a project with no media`. In `index.test.ts`: `shipped content validates`, `has 3 to 6 projects and at least 1 experience`, `has the six skill ids exactly once`, `uses the real contact values` (email, phone, LinkedIn, GitHub exact strings). In `sections.test.tsx` update fixtures for the new shapes (cover from `media[0]`, no `image`).
- [ ] **Step 2:** Run `npx vitest run src/content src/sections`. Expected: FAIL (types and rules missing).
- [ ] **Step 3:** Implement the types, rules and data above. Minimal compile fixes: `About` renders `paragraphs` instead of `bio`; `Hero` renders `eyebrow` and `tagline`; `Contact` keeps its links and adds the phone as a `tel:` link; `ProjectCard` cover uses `media[0]` (alt `""`), `ProjectDetail` renders every `media` item as an `img` with its alt. No other UI work yet.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass.
- [ ] **Step 5:** Commit `feat: real profile content model and validation`.

### Task 2: Experience section, sixth section stop, six die blocks, nav

**Files:**
- Create: `src/sections/Experience.tsx`, `src/scene/chip/fade.ts`, `src/scene/chip/fade.test.ts`
- Modify: `src/state/tourStore.ts`, `src/scene/cameraPath.ts`, `src/scene/cameraPath.test.ts`, `src/scene/chip/geometry.ts`, `src/scene/chip/geometry.test.ts`, `src/scene/chip/Package.tsx`, `src/scene/chip/Die.tsx` (only if it hard-codes four blocks), `src/sections/Nav.tsx`, `src/App.tsx`, `src/styles/global.css`, `src/sections/sections.test.tsx`, `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: `content.experience` (Task 1).
- Produces:
  - `SectionId` includes `'experience'`; `SECTION_ORDER = ['hero','about','skills','experience','projects','contact']`.
  - `waypoints.experience: CameraPose` in `cameraPath.ts` (camera skims over the trace network from above).
  - `packageOpacity(progress: number): number` in `src/scene/chip/fade.ts`, piecewise-linear over stops at `i / (SECTION_ORDER.length - 1)` using a per-section table `{ hero: 1, about: 0.88, skills: 0.1, experience: 1, projects: 1, contact: 1 }`; clamps and is NaN-safe (non-finite gives 1). `Package.tsx` imports it and no longer holds hard-coded stops.
  - `dieBlocks` has six entries, one per skill id, all inside the die (half-size 0.95), non-overlapping.
  - `Experience` default export, `<section id="experience">`, heading `Experience`, an ordered timeline (`<ol>`) newest first; each item shows role, `organization, place`, period, outcomes as a list, tag chips, optional `Repository` link, optional image with its alt text.

- [ ] **Step 1: Write failing tests.** `fade.test.ts`: `equals the table value at each section stop` (loop `SECTION_ORDER`, `progress = i/(n-1)`); `interpolates between stops` (midpoint of hero and about is the mean of 1 and 0.88); `clamps and tolerates NaN` (-1 gives 1, 2 gives 1, NaN gives 1). `cameraPath.test.ts`: replace hard-coded `0.25` style indexes with `i/(SECTION_ORDER.length-1)`; `poseAt equals the waypoint at every section stop`; `experience waypoint is distinct from skills and projects`. `geometry.test.ts`: `dieBlocks cover all six skill ids exactly once`; `every die block lies inside the die bounds`; `no two die blocks overlap` (axis-aligned rectangle test in x/z). `sections.test.tsx`: `Experience renders both internships newest first with outcomes`; `omits the repo link and image when absent`; `Nav lists six links including Experience`; the existing section-id test now expects six ids. `e2e/smoke.spec.ts`: the nav and section loops use the six ids; rename the 375px test to six links and keep its assertion on the last link's right edge.
- [ ] **Step 2:** Run `npx vitest run src/scene src/sections src/state`. Expected: FAIL.
- [ ] **Step 3:** Implement. Tune the `experience` waypoint, the six die block positions and the retuned neighbour waypoints visually, as in the original scene task: throwaway harness (not committed) with Playwright Chromium and SwiftShader flags (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`), screenshot the skills, experience and projects stops under `.superpowers/` (untracked), look at them, and confirm: six labelled-by-colour blocks visible at skills, traces visible from above at experience, pins visible at projects. Add the nav CSS so six links fit in 375px (reduce gap/size under `@media (max-width: 420px)` or wrap), plus timeline CSS.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`, then `PW_CHROMIUM_PATH=... npm run test:e2e`. Expected: all pass.
- [ ] **Step 5:** Commit `feat: experience section, sixth camera stop and six die blocks`.

### Task 3: Hero, About, photo slot, real CV

**Files:**
- Create: `src/sections/ProfilePhoto.tsx`
- Modify: `src/sections/Hero.tsx`, `src/sections/About.tsx`, `src/styles/global.css`, `public/cv.pdf` (replace with the owner's CV from `/root/.claude/uploads/20dc5b20-e544-5499-91e0-f8583ef3cbf4/11d4ee4b-Resume_choukyassine.pdf`)
- Test: `src/sections/sections.test.tsx` (or a new `src/sections/profile.test.tsx`)

**Interfaces:**
- Consumes: `content.about` (Task 1), `assetUrl`.
- Produces: `ProfilePhoto({ name, src }: { name: string; src?: string }): JSX.Element`. With no `src`, or after the `<img>` fires `error`, it renders a decorative frame containing the initials of `name` (first letters of the first and last word, upper case, `YC`); with a working `src` it renders `<img src={assetUrl(src)} alt={`Portrait of ${name}`}>`. Corner pin notches are CSS only.

- [ ] **Step 1: Write failing tests.** `ProfilePhoto shows YC initials when no photo is set`; `shows an img with alt "Portrait of Yassine Chouk" when src is set` and its `src` starts with `import.meta.env.BASE_URL`; `falls back to the initials when the image errors` (`fireEvent.error(img)`); `Hero shows the eyebrow, name, headline, tagline and three actions` (links: `#projects`, the CV href via `assetUrl`, `#contact`); `About shows the three paragraphs, the three highlights, the education line and the spoken languages`; `About links to GitHub and LinkedIn`.
- [ ] **Step 2:** Run `npx vitest run src/sections`. Expected: FAIL.
- [ ] **Step 3:** Implement. Hero: eyebrow, a small name line, `h1` = headline, tagline, buttons `See my work`, `Download CV`, `Say hello`. About: two-column grid (photo left, text right) that stacks on narrow screens; heading `Hi, I'm Yassine.`; paragraphs; highlight chips; facts strip. Copy the CV PDF into `public/cv.pdf` and check it starts with `%PDF` and is under 1 MB.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`, then check at 375px with Playwright that there is no horizontal overflow (report the measurement). Expected: pass.
- [ ] **Step 5:** Commit `feat: hero, about with photo slot and real cv`.

### Task 4: Contact section and Web3Forms query form

**Files:**
- Create: `src/sections/contactForm.ts`, `src/sections/ContactForm.tsx`
- Modify: `src/sections/Contact.tsx`, `src/styles/global.css`
- Test: `src/sections/contactForm.test.ts`, `src/sections/ContactForm.test.tsx`, `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `content.contact`, `content.about.links`, `assetUrl`.
- Produces (`contactForm.ts`, pure, no React):
  - `type FormValues = { name: string; email: string; message: string; botcheck: string }`
  - `type FormErrors = Partial<Record<'name' | 'email' | 'message', string>>`
  - `validateForm(v: FormValues): FormErrors` (name non-empty after trim; email matches a simple `x@y.z` pattern; message 10 to 2000 characters after trim)
  - `type SubmitResult = { ok: true } | { ok: false; reason: 'network' | 'timeout' | 'server' }`
  - `submitForm(v: FormValues, accessKey: string, opts?: { fetchImpl?: typeof fetch; timeoutMs?: number }): Promise<SubmitResult>`: a non-empty `botcheck` returns `{ ok: true }` without any request; otherwise POSTs JSON `{ access_key, name, email, message, subject: 'Portfolio query', from_name: name, botcheck }` to `https://api.web3forms.com/submit`, aborts after `timeoutMs` (default 10000) with `reason: 'timeout'`, a thrown fetch gives `'network'`, a non-2xx status or a body with `success !== true` gives `'server'`.
  - `isPlaceholderKey(key: string): boolean` (true when empty or it contains `TODO`).
- `ContactForm({ accessKey, email }: { accessKey: string; email: string })`: labels for name, email, message; a visually hidden honeypot input named `botcheck` (`tabIndex={-1}`, `aria-hidden`, `autoComplete="off"`); per-field errors with `aria-describedby` and a polite `role="status"` live region for the result; status `idle | sending | success | error`; button disabled while sending; success shows a thank-you and clears the fields; error shows a message plus a `mailto:` link to `email`. With a placeholder key it renders only an email-link button (`Email me`) and a short note. A one-line privacy note: "Messages are sent to my inbox through Web3Forms."
- `Contact` shows direct links (email, `tel:+21621691995` showing the phone, LinkedIn, GitHub, Download CV) beside the form (stacked on narrow screens).

- [ ] **Step 1: Write failing tests.** `contactForm.test.ts` (inject `fetchImpl`): `validateForm flags empty name, bad email and short or long message`; `validateForm accepts a valid set`; `submitForm sends the expected JSON body to the Web3Forms URL`; `submitForm returns ok on {success:true}`; `returns server on success:false and on HTTP 500`; `returns network when fetch throws`; `returns timeout when the request never resolves` (timeoutMs 20, abort-aware fake); `a filled botcheck makes no request and returns ok` (`fetchImpl` not called); `isPlaceholderKey is true for TODO(owner) text and empty, false for a real-looking key`. `ContactForm.test.tsx`: `shows field errors and sends nothing on invalid input`; `disables the button while sending so a double click sends once`; `shows the thank-you and clears the fields on success`; `shows an error with an email link on failure`; `renders only the email-link button when the key is a placeholder`. `sections.test.tsx`: `Contact shows the tel link, email, LinkedIn, GitHub and CV link`.
- [ ] **Step 2:** Run `npx vitest run src/sections`. Expected: FAIL.
- [ ] **Step 3:** Implement as specified; keep fetch injectable so tests never touch the network.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`; check 375px has no horizontal overflow (report measurement). Expected: pass.
- [ ] **Step 5:** Commit `feat: contact section with web3forms query form`.

### Task 5: Project media, proof chips, lightbox

**Files:**
- Create: `public/projects/freertos-inspector/{inspector,inspector-fault,bench}.webp`, `public/projects/ota-bootloader/{arch,memory-layout}.webp`, `public/projects/trackify/{prototype,concept}.webp`, `public/projects/aqua-genius/prototype.webp`, `public/experience/qehna-deadband.webp`, `src/sections/Lightbox.tsx`, `src/content/media.test.ts`
- Modify: `src/content/index.ts` (media entries), `src/sections/ProjectCard.tsx`, `src/sections/ProjectDetail.tsx`, `src/styles/global.css`, `src/sections/sections.test.tsx`

**Interfaces:**
- Consumes: `Media`, `Project.metrics`, `Project.media` (Task 1), `assetUrl`.
- Produces: `Lightbox({ item, onClose }: { item: Media | null; onClose: () => void }): JSX.Element | null` (`role="dialog"`, `aria-modal="true"`, labelled by the caption, close button, Escape and backdrop click close it, focus moves to the close button on open and the opener regains focus on close).
- Image sources (read-only clones in `/home/user/yassinechouk/`): `freertos-inspector/docs/images/inspector.png` (crop to the top part with the verdict, stats and CPU strip), `.../inspector-fault.png`, `.../bench.jpg`; `bootloader_ota/docs/arch_diagram.jpg`, `bootloader_ota/docs/memory_layout.jpg`; `smart-belt-alzheimer/images/prototype_reel.jpg` (cover), `smart-belt-alzheimer/images/prototype.png`; `aqua_genius_project/assets/prototype.jpg`; `c2000-vf-motor-control/docs/images/oscillo_deadband_300ns.jpg`. Output `.webp`, at most 1200 px wide, about 150 KB or less. Tooling for resizing is the implementer's choice (a one-off script that is not committed).
- Media entries (look at each output image and correct any caption that does not match what it shows): Inspector cover, alt "FreeRTOS Inspector dashboard with an All tasks on time verdict, CPU load and the task table", caption "Live dashboard on the bench: 13 tasks discovered, every deadline met, CPU 47.8% busy."; fault, caption "After an injected CPU hog, the Inspector names the late tasks."; bench, caption "The hardware-in-the-loop bench: an STM32 board under test, two ESP32-S3 boards and a speed potentiometer."; bootloader arch, caption "One STM32 with a 32 KB bootloader and two 480 KB slots, reachable over UART or a Wi-Fi gateway."; memory layout, caption describing the flash layout it shows; Trackify prototype, caption "Working prototype: ESP32-S3, GPS, SIM800L GSM modem, motion sensor and an SOS button."; concept, caption "The imagined wearable product."; AQUA prototype, caption "Field prototype: ESP32-S3 controller, soil sensor and pump on two water tanks."; Qehna image (`experience[0].image`), caption "300 ns dead-time between complementary PWM signals, measured on the oscilloscope."

- [ ] **Step 1: Write failing tests.** `media.test.ts` (node `fs`): `every project media and experience image file exists under public/`; `every image is 200 KB or smaller`; `every media entry has non-empty alt and caption`. `sections.test.tsx`: `ProjectCard shows the cover from media[0] and one chip per metric`; `ProjectCard without media renders no img`; `ProjectDetail renders every media item with its caption`; `a project with no media renders no gallery`; `clicking a detail image opens the lightbox dialog with the caption`; `Escape closes the lightbox and returns focus to the opener`; `the close button and a backdrop click close it`; `Experience renders the Qehna image with alt text`.
- [ ] **Step 2:** Run `npx vitest run src/content src/sections`. Expected: FAIL.
- [ ] **Step 3:** Produce the images, add the media entries and implement the card chips (`metrics`), the detail gallery (figure + figcaption, thumbnails as buttons that open the lightbox) and `Lightbox`. Keep the first-media-as-cover rule and decorative `alt=""` on the card cover.
- [ ] **Step 4:** Run `npm run lint && npm run typecheck && npm test && npm run build`; report total size of `public/projects` and `public/experience`. Expected: pass, total under about 1.7 MB.
- [ ] **Step 5:** Commit `feat: project media, proof chips and lightbox`.

### Task 6: End-to-end coverage, README, final checks

**Files:**
- Modify: `e2e/smoke.spec.ts`, `README.md`
- Create: `e2e/profile.spec.ts`

**Interfaces:**
- Consumes: everything above. The e2e files may import `../src/content` (pure data) to read the shipped values.

- [ ] **Step 1: Write the tests** in `e2e/profile.spec.ts` (relative URLs, base `/portfolio/`): `the Experience section lists both internships`; `every project media and experience image responds 200 with an image content type under /portfolio/` (loop over `content`); `the CV responds 200 as application/pdf`; `the tel link and the LinkedIn and GitHub links have the real hrefs`; `no horizontal overflow at 375px` (`document.documentElement.scrollWidth <= 375`); `the contact form submits to a mocked Web3Forms route and shows the thank-you` (use `page.route('https://api.web3forms.com/**', ...)` returning `{ success: true }`; run only when the shipped key is not a placeholder, otherwise assert the `Email me` fallback is shown instead); `the lightbox opens from a project detail image and Escape closes it`.
- [ ] **Step 2:** Run `npm run build && PW_CHROMIUM_PATH=... npm run test:e2e`. Fix any real failures in the code, not by weakening a test. Expected: all pass.
- [ ] **Step 3:** Update `README.md`: the six sections and the scroll tour; how to edit `about`, `experience`, `projects` (metrics, media) and skills in `src/content/`; the image rules (relative paths, `.webp`, 1200 px, about 150 KB) and where images live; adding `public/profile.jpg` and setting `about.photo`; the Web3Forms steps (create a free access key for `yassine.chouk@insat.ucar.tn` at web3forms.com, paste it into `contact.form.accessKey`, until then the site shows an email button and the deploy refuses); the Before-launch checklist (placeholders, Trackify role, photo, key, repo public, accent colour). Keep it accurate (grep every path and script).
- [ ] **Step 4:** Run the full local gate: `npm ci && npm run lint && npm run typecheck && npm test && npm run build && PW_CHROMIUM_PATH=... npm run test:e2e`. Expected: all pass with pristine output.
- [ ] **Step 5:** Commit `test: profile e2e coverage and readme update`.

---

## Self-review notes

- **Spec coverage:** real data and CV (Tasks 1, 3); section order, camera stop, derived fade, six die blocks, nav (Task 2); Experience (Task 2); Hero/About/photo (Task 3); Contact + form (Task 4); project media, chips, lightbox (Task 5); tests, README, deploy-gate behavior (Tasks 1, 5, 6). Out-of-scope items (CAN project, hosting, custom domain) are not planned.
- **Deviation from the spec text:** `about.eyebrow` is added to the content model, so the Hero eyebrow no longer lives in a component (this closes a deferred review item about hard-coded text in sections).
- **Owner inputs still needed:** the Web3Forms key, the profile photo, the Trackify role confirmation, the copy review, and making the repo public before publishing. The deploy gate keeps refusing while `TODO(owner)` markers remain.
