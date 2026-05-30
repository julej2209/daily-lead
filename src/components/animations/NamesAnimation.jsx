import { useEffect, useRef } from 'react'

const NAME_SPIN_MS = 2600

export default function NamesAnimation({ pool, winner, spinning, onComplete }) {
  const displayRef = useRef(null)
  const timersRef = useRef([])

  useEffect(() => {
    if (!spinning || !winner || !pool.length) return

    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    const start = performance.now()

    const step = (now) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / NAME_SPIN_MS, 1)
      const eased = 1 - (1 - progress) ** 3

      if (progress >= 1) {
        if (displayRef.current) displayRef.current.textContent = winner
        onComplete?.()
        return
      }

      if (displayRef.current) {
        displayRef.current.textContent =
          pool[Math.floor(Math.random() * pool.length)]
      }

      const delay = 40 + eased * 180
      const id = setTimeout(() => requestAnimationFrame(step), delay)
      timersRef.current.push(id)
    }

    requestAnimationFrame(step)

    return () => timersRef.current.forEach(clearTimeout)
  }, [pool, winner, spinning, onComplete])

  if (!spinning || !winner) return null

  return (
    <p
      ref={displayRef}
      className="max-w-full break-words text-3xl font-bold tracking-tight animate-pulse-soft text-violet-600 sm:text-5xl"
    >
      …
    </p>
  )
}
