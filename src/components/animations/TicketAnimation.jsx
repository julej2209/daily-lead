import { useEffect, useState } from 'react'
import { fireGoldenConfetti } from '../../lib/goldenConfetti'

export default function TicketAnimation({ winner, spinning, onComplete }) {
  const [phase, setPhase] = useState('sealed')
  const [showName, setShowName] = useState(false)

  useEffect(() => {
    if (!spinning || !winner) return
    setPhase('sealed')
    setShowName(false)

    const breakTimer = setTimeout(() => setPhase('break'), 700)
    const openTimer = setTimeout(() => setPhase('open'), 1300)
    const slideTimer = setTimeout(() => setPhase('slide'), 1900)
    const nameTimer = setTimeout(() => {
      setShowName(true)
      fireGoldenConfetti()
    }, 2800)
    const doneTimer = setTimeout(() => onComplete?.(), 4200)

    return () => {
      clearTimeout(breakTimer)
      clearTimeout(openTimer)
      clearTimeout(slideTimer)
      clearTimeout(nameTimer)
      clearTimeout(doneTimer)
    }
  }, [winner, spinning, onComplete])

  if (!spinning || !winner) return null

  return (
    <div className="anim-golden-wrap">
      {phase === 'break' && <div className="anim-golden-flash" aria-hidden />}

      <div
        className={`anim-golden-envelope ${phase !== 'sealed' && phase !== 'break' ? 'anim-golden-envelope--open' : ''} ${phase === 'break' ? 'anim-golden-envelope--break' : ''}`}
      >
        <div className="anim-golden-env-back" />
        <div className="anim-golden-env-front" />
        <div className="anim-golden-env-flap" />

        {(phase === 'sealed' || phase === 'break') && (
          <div className={`anim-golden-seal ${phase === 'break' ? 'anim-golden-seal--break' : ''}`}>
            <span className="anim-golden-seal-mark">★</span>
          </div>
        )}

        <div
          className={`anim-golden-ticket ${phase === 'slide' || showName ? 'anim-golden-ticket--out' : ''}`}
        >
          <div className="anim-golden-ticket-shimmer" aria-hidden />
          <p className="anim-golden-ticket-title">Золотой билет</p>
          <p className="anim-golden-ticket-sub">Ведущий встречи</p>
          <p
            className={`anim-golden-ticket-name ${showName ? 'anim-golden-ticket-name--show' : ''}`}
          >
            {winner}
          </p>
        </div>
      </div>
    </div>
  )
}
