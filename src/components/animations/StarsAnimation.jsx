import { useEffect, useMemo, useState } from 'react'
import confetti from 'canvas-confetti'

export default function StarsAnimation({ pool, winner, spinning, onComplete }) {
  const [phase, setPhase] = useState('scatter')

  const stars = useMemo(
    () =>
      pool.map((name, i) => ({
        name,
        x: 10 + ((i * 47) % 80),
        y: 10 + ((i * 31) % 70),
        delay: i * 0.04,
      })),
    [pool],
  )

  useEffect(() => {
    if (!spinning || !winner) return
    setPhase('scatter')
    const pullTimer = setTimeout(() => setPhase('merge'), 100)
    const flashTimer = setTimeout(() => {
      setPhase('reveal')
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#fbbf24', '#a78bfa', '#fff'],
      })
    }, 2800)
    const doneTimer = setTimeout(() => onComplete?.(), 3800)

    return () => {
      clearTimeout(pullTimer)
      clearTimeout(flashTimer)
      clearTimeout(doneTimer)
    }
  }, [pool, winner, spinning, onComplete])

  if (!spinning || !winner) return null

  return (
    <div className="anim-stars-wrap">
      {stars.map((star) => (
        <span
          key={star.name}
          className={`anim-star ${phase !== 'scatter' ? 'anim-star--merge' : ''}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            transitionDelay: `${star.delay}s`,
          }}
        >
          {star.name.length > 8 ? `${star.name.slice(0, 7)}…` : star.name}
        </span>
      ))}
      {phase === 'merge' && <div className="anim-stars-flash" />}
      {(phase === 'reveal' || phase === 'merge') && (
        <p className={`anim-stars-winner ${phase === 'reveal' ? 'anim-stars-winner--show' : ''}`}>
          {winner}
        </p>
      )}
    </div>
  )
}
