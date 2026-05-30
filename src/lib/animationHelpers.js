export const ITEM_H = 48

export function buildReelStrip(pool, winner, repeats = 8) {
  const strip = []
  for (let i = 0; i < repeats; i += 1) strip.push(...pool)
  const targetIndex = strip.length - Math.ceil(pool.length / 2) - 1
  strip[targetIndex] = winner
  return { strip, targetIndex }
}

export function buildExtendedPool(pool, winner, minItems = 30) {
  const items = []
  while (items.length < minItems) items.push(...pool)
  const targetIndex = items.length - pool.length - 1
  items[targetIndex] = winner
  return { items, targetIndex }
}

export function randomPositions(count, width, height) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 8 + Math.random() * (width - 16),
    y: 8 + Math.random() * (height - 16),
    size: 0.6 + Math.random() * 0.6,
  }))
}
