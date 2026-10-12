import { type Browser, expect, test } from '@playwright/test'
import { content } from '../src/content'
import { isPlaceholderKey } from '../src/sections/contactForm'

const { about, contact, experience, projects } = content

const SECTION_IDS = ['hero', 'about', 'skills', 'experience', 'projects', 'contact']

test('the Experience section lists both internships', async ({ page }) => {
  await page.goto('')
  const section = page.locator('#experience')
  await expect(section.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
  expect(experience.length).toBe(2)
  await expect(section.locator('article.job')).toHaveCount(experience.length)
  for (const job of experience) {
    const article = section.locator('article.job').filter({ has: page.getByRole('heading', { level: 3, name: job.role }) })
    await expect(article).toContainText(job.organization)
    await expect(article).toContainText(job.period)
    await expect(article.locator('.job-outcomes li')).toHaveCount(job.outcomes.length)
  }
})

test('every project media and experience image responds 200 with an image/webp content type under /portfolio/', async ({
  baseURL,
  request,
}) => {
  const srcs = [
    ...projects.flatMap((p) => p.media.map((m) => m.src)),
    ...experience.flatMap((e) => (e.image ? [e.image.src] : [])),
  ]
  expect(srcs.length).toBeGreaterThan(0)
  for (const src of srcs) {
    const url = new URL(src, baseURL)
    expect(url.pathname, src).toMatch(/^\/portfolio\//)
    const res = await request.get(url.href)
    expect(res.status(), src).toBe(200)
    expect(res.headers()['content-type'], src).toContain('image/webp')
  }
})

test('the CV responds 200 as application/pdf', async ({ baseURL, request }) => {
  const url = new URL(about.links.cv, baseURL)
  expect(url.pathname).toBe('/portfolio/cv.pdf')
  const res = await request.get(url.href)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('application/pdf')
})

test('the tel link and the LinkedIn and GitHub links have the real hrefs', async ({ page }) => {
  await page.goto('')
  const contactSection = page.locator('#contact')
  await expect(contactSection.getByRole('link', { name: contact.phone })).toHaveAttribute('href', 'tel:+21621691995')
  await expect(contactSection.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', about.links.linkedin)
  await expect(contactSection.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', about.links.github)
  expect(about.links.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\//)
  expect(about.links.github).toMatch(/^https:\/\/github\.com\//)
})

test('no horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await page.goto('')
  await expect(page.locator('#contact')).toBeAttached()
  await expect(page.locator('.lightbox')).toHaveCount(0)
  const scrollWidth = () => page.evaluate(() => document.documentElement.scrollWidth)
  expect(await scrollWidth()).toBeLessThanOrEqual(375)

  // With the project detail and its gallery rendered.
  await page.locator('nav a[href="#projects"]').click()
  await expect(page.locator('.project-detail .gallery-button').first()).toBeAttached()
  expect(await scrollWidth()).toBeLessThanOrEqual(375)
})

test('the contact form submits to a mocked Web3Forms route and shows the thank-you', async ({ page }) => {
  await page.goto('')
  const section = page.locator('#contact')
  if (isPlaceholderKey(contact.form.accessKey)) {
    await expect(section.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', `mailto:${contact.email}`)
    await expect(section.locator('form')).toHaveCount(0)
    await expect(section.getByLabel('Name')).toHaveCount(0)
    await expect(section.getByLabel('Message')).toHaveCount(0)
    return
  }
  const corsHeaders = {
    'access-control-allow-origin': '*',
    'access-control-allow-headers': '*',
    'access-control-allow-methods': 'POST, OPTIONS',
  }
  let posted: { access_key?: string; email?: string } | null = null
  // Registered before any click. Answers the CORS preflight too, then the JSON POST.
  await page.route('https://api.web3forms.com/**', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: corsHeaders })
      return
    }
    posted = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: corsHeaders,
      body: JSON.stringify({ success: true }),
    })
  })
  // The live region is in the tree (empty) before anything is submitted.
  const status = section.getByRole('status')
  await expect(status).toBeAttached()
  await expect(status).toHaveText('')
  // A failed validation focuses the first invalid field and is announced.
  await section.getByRole('button', { name: 'Send message' }).click()
  await expect(section.getByLabel('Name')).toBeFocused()
  await expect(status).toContainText('Please fix 3 fields')
  await section.getByLabel('Name').fill('Test Visitor')
  await section.getByLabel('Email').fill('visitor@example.com')
  await section.getByLabel('Message').fill('Hello, this is a test message.')
  await section.getByRole('button', { name: 'Send message' }).click()
  await expect(status).toContainText('Thank you')
  expect(posted).toMatchObject({ access_key: contact.form.accessKey, email: 'visitor@example.com' })
})

test('the lightbox opens from a project detail image and Escape closes it', async ({ page }) => {
  await page.goto('')
  const opener = page.locator('.project-detail .gallery-button').first()
  await expect(opener).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('img')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()

  // Escape still closes after a click inside the dialog.
  await opener.click()
  await expect(dialog).toBeVisible()
  await dialog.locator('img').click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

async function expectColdClicksLandOnTheirSection(browser: Browser, baseURL: string | undefined, viewport?: { width: number; height: number }) {
  for (const id of SECTION_IDS) {
    // A fresh load per link, clicked immediately: late-loading content must not shift the target.
    const context = await browser.newContext({ baseURL, viewport })
    try {
      const page = await context.newPage()
      await page.goto('')
      const link = page.locator(`nav a[href="#${id}"]`)
      await link.click()
      await expect(link, id).toHaveAttribute('aria-current', 'location')
      if (id === 'projects') {
        await expect(page.locator('.project-detail h3')).toHaveText(projects[0].title)
      }
    } finally {
      await context.close()
    }
  }
}

test('a cold click on each nav link right after load ends on its own section', async ({ browser, baseURL }) => {
  await expectColdClicksLandOnTheirSection(browser, baseURL)
})

test('a cold click on each nav link right after load ends on its own section at 375px', async ({ browser, baseURL }) => {
  await expectColdClicksLandOnTheirSection(browser, baseURL, { width: 375, height: 667 })
})
