import { expect, test } from '@playwright/test'

test('edits a gradient, moves text, fixes contrast, and exposes CSS', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Gradient' })).toBeVisible()

  await page.getByLabel('Gradient angle').fill('32')
  await page.getByLabel('Text color picker').fill('#C85B72')
  await expect(page.getByText('Estimated AA fail')).toBeVisible()

  const previewText = page.getByTestId('preview-text')
  await previewText.focus()
  await previewText.press('ArrowRight')
  await previewText.press('ArrowDown')

  await page.getByRole('button', { name: 'Make readable' }).click()
  await expect(page.getByText('Estimated AA pass')).toBeVisible()
  await expect(page.getByTestId('css-output')).toContainText('.gradient-hero')
  await expect(page.getByTestId('css-output')).toContainText('linear-gradient(32deg')
})

test('mobile editing keeps the canvas visible and resamples after resizing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await page.getByRole('tab', { name: 'controls' }).click()
  await expect(page.getByTestId('preview-frame')).toBeVisible()
  await page.getByRole('textbox', { name: 'Content', exact: true }).fill('Readable everywhere')
  await expect(page.getByTestId('preview-text')).toHaveText('Readable everywhere')
  await page.getByRole('tab', { name: 'results' }).click()
  await expect(page.getByText('Estimated AA fail')).toBeVisible()
  await page.getByRole('button', { name: 'Make readable' }).click()
  await expect(page.getByText('Estimated AA pass')).toBeVisible()
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await expect(page.getByText('Estimated AA fail')).toBeVisible()
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await expect(page.getByText('Estimated AA pass')).toBeVisible()
  await page.getByRole('button', { name: 'Share configuration' }).click()
  await expect(page).toHaveURL(/state=/)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSS file' }).click()
  expect((await download).suggestedFilename()).toBe('gradient-guard.css')
  await page.setViewportSize({ width: 1024, height: 768 })
  await expect.poll(() => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) =>
    Math.abs(canvas.width - Math.round(canvas.getBoundingClientRect().width * devicePixelRatio)),
  )).toBeLessThanOrEqual(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await expect(page.getByTestId('preview-text')).toHaveText('Readable everywhere')
})
