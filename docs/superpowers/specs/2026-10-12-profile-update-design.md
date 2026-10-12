# Portfolio Profile Update: Design

Date: 2026-10-12
Owner: Yassine Chouk
Extends: `docs/superpowers/specs/2026-10-12-portfolio-design.md` (the base spec; everything in it still holds unless this document says otherwise)
Status: Draft for review

## 1. Purpose and success criteria

Turn the working portfolio into a finished one for a strong embedded-systems engineer seeking a firmware internship: real profile data, a catchy About with a photo slot, a new Experience section, real projects with real images and proof, and a working query form. **The 3D chip scene and its scroll tour stay**; this update extends them.

Success means:
- A recruiter sees who Yassine is, what he builds, and measured proof of it within one scroll of the page.
- Every fact comes from the owner's CV or repos; the copy is original wording, not pasted CV text.
- The chip scene, camera tour, lit project pin, fallbacks and tests all still work, with one more camera stop and two more die blocks.
- A visitor can send a query that lands in the owner's inbox without leaving the site.
- Lint, type-check, unit tests, build and e2e stay green.

## 2. Decisions made

| Topic | Decision |
|---|---|
| Section order | Hero, About, Skills, **Experience (new)**, Projects, Contact |
| Skill groups / die blocks | **Six**: languages, platforms, firmware, protocols, tools, testing |
| Queries | Real form via **Web3Forms**, with an email-link fallback when no key is set |
| Photo | Slot at `public/profile.jpg`; placeholder ("YC" frame) until it exists |
| Project media | Images and screenshots from the owner's GitHub READMEs, optimized and committed |
| Projects | The four on the CV (CAN monitoring repo explicitly **not** added now) |
| Phone | Shown publicly as a tap-to-call link (owner's explicit choice) |
| Hosting | Unchanged (GitHub Pages). The repo is private for now; the owner will make it public later. Pages on a free plan needs a public repo |

## 3. Real profile data

- Name: Yassine Chouk. Email: `yassine.chouk@insat.ucar.tn`. Phone: `+216 21 691 995` (`tel:+21621691995`).
- LinkedIn: `https://www.linkedin.com/in/yassine-chouk-8ba806312/`. GitHub: `https://github.com/yassinechouk`.
- Education: INSAT, Engineering degree in Industrial IT & Automation, 2023 to 2028 (expected). Baccalauréat, Experimental Sciences, honors (17.44/20), 2023.
- Languages: Arabic (native), English (IELTS 7.0, C1), French (C1), German (ÖSD A2).
- CV: copy the uploaded PDF to `public/cv.pdf`, replacing the placeholder.

## 4. Structure and scene impact

- `SectionId` and `SECTION_ORDER` gain `'experience'` between `skills` and `projects`.
- `cameraPath.ts` gets an `experience` waypoint: the camera skims over the glowing trace network from above, so the traces read as a career path. It remains the only file mapping sections to camera positions. Existing waypoints are retuned only if the new stop's blend needs it.
- `Package.tsx` fade stops are derived from `SECTION_ORDER` (`i / (SECTION_ORDER.length - 1)`), not hard-coded at 0.25/0.5/0.75 (this was a deferred review item that six sections make a real bug).
- `SkillGroup['id']` becomes `'languages' | 'platforms' | 'firmware' | 'protocols' | 'tools' | 'testing'`. `dieBlocks` in `src/scene/chip/geometry.ts` covers all six ids exactly once; the die layout and its tests are updated. Labels: Languages, Platforms, RTOS & Firmware, Protocols, Tools, Testing.
- Nav gets an Experience link; the six links must still fit at 375px width.
- All existing fallbacks (no WebGL, lost context, reduced motion) are unchanged.

## 5. Content model (`src/content/`)

- `about`: `name`, `headline`, `tagline`, `paragraphs: string[]` (2 to 3), `highlights: string[]` (3), `education: string`, `spokenLanguages: string[]`, `photo?: string`, `links: { cv, github, linkedin }`.
- `experience: ExperienceItem[]` where `ExperienceItem = { id, role, organization, place, period, outcomes: string[] (1 to 2), tags: string[], repoUrl?: string, image?: string, imageAlt?: string }`.
- `Project` gains `metrics: string[]` (proof chips, 2 to 4) and `media: { src: string; alt: string; caption: string }[]` (0 to 4; first is the card cover). The existing optional `image` is replaced by `media[0]`.
- `contact`: `{ email, phone, form: { accessKey: string } }`.
- `validateContent` rules: projects 3 to 6; experience at least 1; every skill group non-empty and the six ids each exactly once; project `metrics` 2 to 4; unique ids; https URLs; email contains `@`; phone matches `+` and digits.
- All image paths are relative and resolved through `assetUrl`.

## 6. The pages (draft copy; the owner edits freely)

**Hero.** Eyebrow `Embedded · Real-time · Firmware`. Headline: "I make microcontrollers keep their promises." Line: "Firmware that meets its deadlines, from bare-metal bootloaders to RTOS-driven motor control." Buttons: See my work, Download CV, Say hello.

**About.** Two columns. Left: square photo frame with chip-pin notches on its corners; shows `public/profile.jpg` with alt text if `photo` is set and the file exists, otherwise a "YC" placeholder. Right:
- Heading "Hi, I'm Yassine."
- "I'm an engineering student at INSAT in Tunis who likes the part of software where a late answer is a wrong answer. I write C and C++ firmware for STM32, ESP32-S3 and TI C2000 chips, and I like proving it works on a bench with an oscilloscope, not just in a simulator."
- "My favourite problems sit between the code and the hardware: making an update survive a power cut, catching a missed deadline before the motor does, fitting a model into a few hundred kilobytes."
- "Right now I'm looking for an embedded firmware internship where I can keep building things that have to be right the first time."
- Highlight chips: Real-time firmware · Bootloaders & OTA · Hardware-in-the-loop testing.
- Facts strip: education line and spoken languages.

**Experience.** A timeline of cards, newest first:
- Qehna LAB (ENIT), Tunis, Jun 2026: Embedded control intern. Drove a three-phase induction motor from a TI C2000 with open-loop V/f control; used third-harmonic injection for about 15.5% more DC-bus use; checked the sine references and the 300 ns dead-time on an oscilloscope. Repo link; one oscilloscope capture as evidence.
- Sagemcom, Ezzahra, Aug 2025: Test automation intern. Built LOGCOMPARE, a Python tool that checks test-bench logs against a reference with colour-coded thresholds, replacing about half an hour of manual inspection per run. Repo link.

**Projects** (four, newest first; summaries rewritten from the CV and READMEs):

| Project | Proof chips | Media (from the owner's repos) |
|---|---|---|
| FreeRTOS Inspector (Oct 2026) | 13 tasks · 0 deadline misses · 47.8% CPU · 5/5 injected faults caught in under 0.58 s | `inspector.png` (cropped cover), `inspector-fault.png`, `bench.jpg` |
| Dual-slot OTA bootloader (Sep 2026) | 3-layer verification · automatic rollback · 43 host tests | `arch_diagram.jpg` (cover), `memory_layout.jpg` |
| Trackify, fall-detection safety device (Dec 2025) | Random Forest on-device · Wi-Fi alerts + GSM SMS fallback | `prototype_reel.jpg` (cover), `prototype.png` |
| AQUA GENIUS, edge-ML irrigation (Oct 2025) | under 10 ms inference · ~400 KB flash · ~1 KB RAM · bit-exact with Python | `prototype.jpg` |

Roles on team projects (Trackify) use the CV's wording and are flagged for the owner to confirm in review. Each card shows the cover and the chips; the detail view shows all media with captions (written from the READMEs), a lightbox on click, tags, role, and the source link.

**Media pipeline.** Images are copied from the six repos into `public/projects/<project-id>/` and `public/experience/`, resized to 1200px wide at most and compressed to about 150 KB each (about 1.5 MB total). Each gets alt text and a caption. The Inspector cover is cropped to the verdict and stats area. LOGCOMPARE has no images and stays text-only.

**Contact.** Two columns.
- Direct: email, phone (`tel:` link), LinkedIn, GitHub, Download CV.
- Form (Web3Forms): name, email, message, hidden spam-trap field. Rules: name required; email must look valid; message 10 to 2000 characters; errors appear beside each field and are announced to screen readers. The request is a JSON POST to `https://api.web3forms.com/submit` with a 10-second timeout; the button is disabled while sending. Success shows a thank-you and clears the form. Failure shows an error with an email-the-owner link. A filled spam trap sends nothing and shows no error. If `form.accessKey` is still the placeholder, the form is replaced by an email-link button, so it never looks broken. A single privacy line states that messages go to the owner's inbox through Web3Forms. No cookies or browser storage.
- The access key is a public-safe value. It carries a `TODO(owner)` marker until the owner pastes the real key, so the deploy gate refuses to ship a dead form.

## 7. Testing

- Unit: the form (success, server error, network failure, timeout, trap filled, invalid input, double-submit prevented, no-key fallback); content validation with the new fields and rules; `cameraPath` and `Package` fade derived from `SECTION_ORDER` for six sections; six die blocks covering all ids once; About photo placeholder versus image; Experience cards; project cards with metrics and media; lightbox open and close by keyboard.
- E2E: six nav links each scroll to their section; the Experience section is visible; the form submits against a mocked Web3Forms route and shows the success message (no real emails during tests); the nav fits at 375px with six links; project images resolve with 200 and an image content type under `/portfolio/`.
- Lint, type-check, build and CI stay green; the deploy gate keeps refusing while `TODO(owner)` markers remain.

## 8. Out of scope

The CAN monitoring project, a blog, a CMS, a custom domain, making the repo public, hosting changes, a language switch, and any change to the chip's visual style other than the two extra die blocks and the new camera stop.

## 9. Open items for the owner

- Get a free Web3Forms access key for `yassine.chouk@insat.ucar.tn` and paste it into `src/content/index.ts`.
- Add a profile photo as `public/profile.jpg` and set `about.photo`.
- Review the draft copy and the Trackify role wording.
- Make the repo public (or choose other hosting) before publishing.
