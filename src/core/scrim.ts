import { contrastRatio, mixColors } from './color'

export function minimumScrimOpacity(
  backgrounds: string[],
  textColor: string,
  scrimColor: string,
  threshold: number,
): number {
  const passes = (opacity: number) => backgrounds.every(
    (background) => contrastRatio(textColor, mixColors(background, scrimColor, opacity)) >= threshold,
  )
  if (passes(0)) return 0
  if (!passes(1)) return 1
  let low = 0
  let high = 1
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const middle = (low + high) / 2
    if (passes(middle)) high = middle
    else low = middle
  }
  return high
}
