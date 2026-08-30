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
