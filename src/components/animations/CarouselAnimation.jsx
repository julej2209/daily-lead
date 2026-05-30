import { useEffect, useState } from 'react'
import { ITEM_H, buildExtendedPool } from '../../lib/animationHelpers'
import { CAROUSEL_COLORS } from '../../lib/animationModes'

export default function CarouselAnimation({ pool, winner, spinning, onComplete }) {
  const [offset, setOffset] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!spinning || !winner) return
    setDone(false)
    const { targetIndex } = buildExtendedPool(pool, winner, 35)
    const centerY = 100
    const finalOffset = -(targetIndex * ITEM_H - centerY + ITEM_H / 2)

    setOffset(-ITEM_H)
    requestAnimationFrame(() => setOffset(finalOffset))

    const timer = setTimeout(() => {
      setDone(true)
      setTimeout(() => onComplete?.(), 500)
    }, 2800)

    return () => clearTimeout(timer)
  }, [pool, winner, spinning, onComplete])

  if (!spinning || !winner) return null

  const { items } = buildExtendedPool(pool, winner, 35)

  return (
    <div className="anim-carousel-wrap">
      <div className="anim-carousel-lens" />
      <div
        className="anim-carousel-track"
        style={{
          transform: `translateY(${offset}px)`,
          transition: 'transform 2.6s cubic-bezier(0.12, 0.8, 0.2, 1)',
        }}
      >
        {items.map((name, i) => {
          const color = CAROUSEL_COLORS[i % CAROUSEL_COLORS.length]
          const isWin = done && name === winner
          return (
            <div
              key={`${name}-${i}`}
              className={`anim-carousel-item ${isWin ? 'anim-carousel-item--win' : ''}`}
              style={{
                '--item-color': color,
                backgroundColor: isWin ? undefined : `${color}22`,
                color: isWin ? undefined : color,
                borderLeft: isWin ? undefined : `4px solid ${color}`,
              }}
            >
              {name}
            </div>
          )
        })}
      </div>
    </div>
  )
}
