import { type Page, chromium, expect, test } from '@playwright/test'

const LIGHT_BG = '#f4f6f8'
const DARK_BG = '#05080d'

const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme)
const themeColor = (page: Page) => page.locator('meta[name="theme-color"]').getAttribute('content')
const toggle = (page: Page) => page.getByRole('navigation', { name: 'Sections' }).locator('button.theme-toggle')

test('opens light, with the light theme-color', async ({ page }) => {
  await page.goto('')
  expect(await theme(page)).toBe('light')
  expect(await themeColor(page)).toBe(LIGHT_BG)
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 246, 248)')
})

test.describe('with a dark OS preference', () => {
  test.use({ colorScheme: 'dark' })

  test('still opens light', async ({ page }) => {
    await page.goto('')
    expect(await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches)).toBe(true)
    expect(await theme(page)).toBe('light')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 246, 248)')
  })
})

test('the toggle switches to dark and back, updating the label and theme-color', async ({ page }) => {
  await page.goto('')
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  expect(await theme(page)).toBe('dark')
  expect(await themeColor(page)).toBe(DARK_BG)
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(5, 8, 13)')
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  expect(await theme(page)).toBe('light')
  expect(await themeColor(page)).toBe(LIGHT_BG)
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
})

test('nothing is stored: no web storage, no cookies, and a reload opens light again', async ({ page, context }) => {
  await page.goto('')
  await toggle(page).click()
  await toggle(page).click()
  await toggle(page).click()
  expect(await theme(page)).toBe('dark')
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  expect(await page.evaluate(() => sessionStorage.length)).toBe(0)
  expect(await context.cookies()).toEqual([])
  await page.reload()
  expect(await theme(page)).toBe('light')
})

test('with WebGL disabled the fallback still follows the theme, and both stills are served as PNG', async ({
  baseURL,
  request,
}) => {
  const browser = await chromium.launch({
    args: ['--disable-gpu', '--disable-webgl', '--disable-3d-apis'],
    executablePath: process.env.PW_CHROMIUM_PATH || undefined,
  })
  try {
    const page = await (await browser.newContext({ baseURL })).newPage()
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null
    })
    await page.goto('')
    const still = page.locator('img.static-chip')
    await expect(still).toBeVisible()
    await expect(still).toHaveAttribute('src', '/portfolio/chip-fallback-light.png')
    await toggle(page).click()
    await expect(still).toHaveAttribute('src', '/portfolio/chip-fallback.png')
    await toggle(page).click()
    await expect(still).toHaveAttribute('src', '/portfolio/chip-fallback-light.png')
    for (const name of ['chip-fallback-light.png', 'chip-fallback.png']) {
      const res = await request.get(new URL(name, baseURL).href)
      expect(res.status(), name).toBe(200)
      expect(res.headers()['content-type'], name).toContain('image/png')
    }
  } finally {
    await browser.close()
  }
})

test('at 375px the toggle fits next to the six links, is at least 36px, and toggling does not move the layout', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('')
  const button = toggle(page)
  const box = await button.boundingBox()
  expect(box).not.toBeNull()
  expect(box!.width).toBeGreaterThanOrEqual(36)
  expect(box!.height).toBeGreaterThanOrEqual(36)
  expect(box!.x + box!.width).toBeLessThanOrEqual(375)
  const contact = await page.locator('nav a[href="#contact"]').boundingBox()
  expect(contact!.x + contact!.width).toBeLessThanOrEqual(box!.x)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)

  const layout = () =>
    page.evaluate(() => ({
      header: document.querySelector('.site-header')!.getBoundingClientRect().height,
      height: document.documentElement.scrollHeight,
    }))
  const before = await layout()
  await button.click()
  expect(await layout()).toEqual(before)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
})

test('the toggle shows a focus ring when reached by keyboard', async ({ page }) => {
  await page.goto('')
  await page.locator('nav a[href="#contact"]').focus()
  await page.keyboard.press('Tab')
  const button = toggle(page)
  await expect(button).toBeFocused()
  await expect(button).toHaveCSS('outline-style', 'solid')
  await expect(button).toHaveCSS('outline-width', '3px')
})
