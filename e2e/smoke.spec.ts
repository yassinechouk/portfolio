import { type Browser, chromium, expect, test } from '@playwright/test'

const SECTIONS = ['hero', 'about', 'skills', 'projects', 'contact']

const SWIFTSHADER_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
]

async function launch(args: string[]): Promise<Browser> {
  return chromium.launch({ args, executablePath: process.env.PW_CHROMIUM_PATH || undefined })
}

test('loads with the page title and meta description set', async ({ page }) => {
  await page.goto('')
  await expect(page).toHaveTitle('Yassine Chouk | Embedded, IoT & Systems Engineer')
  const description = await page.locator('meta[name="description"]').getAttribute('content')
  expect(description?.length ?? 0).toBeGreaterThan(40)
})

test('has Open Graph title, description and image tags', async ({ page }) => {
  await page.goto('')
  for (const prop of ['og:title', 'og:description', 'og:image', 'og:url']) {
    const content = await page.locator(`meta[property="${prop}"]`).getAttribute('content')
    expect(content, prop).toBeTruthy()
  }
  const image = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(image).toMatch(/^https:\/\/.+\/portfolio\/og-image\.png$/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  )
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', /^#/)
})

test('each nav link scrolls its section into view', async ({ page }) => {
  await page.goto('')
  const nav = page.getByRole('navigation', { name: 'Sections' })
  for (const id of SECTIONS) {
    await nav.locator(`a[href="#${id}"]`).click()
    await expect(nav.locator(`a[href="#${id}"]`)).toHaveAttribute('aria-current', 'location')
    await expect
      .poll(async () =>
        page.locator(`#${id}`).evaluate((el) => {
          const top = el.getBoundingClientRect().top
          return top >= -2 && top < window.innerHeight
        }),
      )
      .toBe(true)
  }
})

test('with WebGL disabled the static chip image is visible and every section is still reachable', async ({
  baseURL,
}) => {
  const browser = await launch(['--disable-gpu', '--disable-webgl', '--disable-3d-apis'])
  try {
    const page = await (await browser.newContext({ baseURL })).newPage()
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null
    })
    await page.goto('')
    await expect(page.locator('img.static-chip')).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
    for (const id of SECTIONS) {
      await page.locator(`nav a[href="#${id}"]`).click()
      await expect(page.locator(`#${id}`)).toBeInViewport()
    }
  } finally {
    await browser.close()
  }
})

test('with reduced motion emulated no canvas element exists', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('')
  await expect(page.locator('img.static-chip')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('the CV link responds with 200 under /portfolio/', async ({ page, request }) => {
  await page.goto('')
  const cv = page.locator('a[href$="cv.pdf"]').first()
  const href = await cv.evaluate((a) => (a as HTMLAnchorElement).href)
  expect(new URL(href).pathname).toBe('/portfolio/cv.pdf')
  const cvResponse = await request.get(href)
  expect(cvResponse.status()).toBe(200)
  expect(cvResponse.headers()['content-type']).toContain('application/pdf')

  const src = await page.locator('img.static-chip').evaluate((i) => (i as HTMLImageElement).src)
  expect(new URL(src).pathname).toBe('/portfolio/chip-fallback.png')
  const imgResponse = await request.get(src)
  expect(imgResponse.status()).toBe(200)
  expect(imgResponse.headers()['content-type']).toContain('image/png')
})

test('renders a canvas when WebGL is available', async ({ baseURL }) => {
  const browser = await launch(SWIFTSHADER_ARGS)
  try {
    const page = await (await browser.newContext({ baseURL })).newPage()
    await page.goto('')
    await expect(page.locator('canvas')).toHaveCount(1, { timeout: 20000 })
  } finally {
    await browser.close()
  }
})
