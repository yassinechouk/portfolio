import { expect, type Page, test } from '@playwright/test'
import { content } from '../src/content'
import { isPlaceholderKey } from '../src/sections/contactForm'

const { about, contact, experience, projects } = content

// On a tall viewport the Projects link scrolls to the very end of the page, so no
// project is auto-selected; pick one the way a visitor would.
async function selectFirstProject(page: Page) {
  await page.locator('nav a[href="#projects"]').click()
  await page.getByRole('button', { name: projects[0].title }).click()
  await expect(page.locator('.project-detail h3')).toHaveText(projects[0].title)
}

test('the Experience section lists both internships', async ({ page }) => {
  await page.goto('')
  const section = page.locator('#experience')
  await expect(section.getByRole('heading', { level: 2, name: 'Experience' })).toBeVisible()
  await expect(section.locator('article.job')).toHaveCount(experience.length)
  for (const job of experience) {
    const article = section.locator('article.job').filter({ has: page.getByRole('heading', { level: 3, name: job.role }) })
    await expect(article).toContainText(job.organization)
    await expect(article).toContainText(job.period)
    await expect(article.locator('.job-outcomes li')).toHaveCount(job.outcomes.length)
  }
  expect(experience.length).toBe(2)
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

  // With a project detail and its gallery rendered.
  await selectFirstProject(page)
  await expect(page.locator('.project-detail .gallery-button').first()).toBeVisible()
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
  let posted: { access_key?: string; email?: string } | null = null
  await page.route('https://api.web3forms.com/**', async (route) => {
    posted = route.request().postDataJSON()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ success: true }),
    })
  })
  await section.getByLabel('Name').fill('Test Visitor')
  await section.getByLabel('Email').fill('visitor@example.com')
  await section.getByLabel('Message').fill('Hello, this is a test message.')
  await section.getByRole('button', { name: 'Send message' }).click()
  await expect(section.getByRole('status')).toContainText('Thank you')
  expect(posted).toMatchObject({ access_key: contact.form.accessKey, email: 'visitor@example.com' })
})

test('the lightbox opens from a project detail image and Escape closes it', async ({ page }) => {
  await page.goto('')
  await selectFirstProject(page)
  const opener = page.locator('.project-detail .gallery-button').first()
  await expect(opener).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await opener.click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('img')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)

  // Escape still closes after a click inside the dialog.
  await opener.click()
  await expect(dialog).toBeVisible()
  await dialog.locator('img').click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
})
