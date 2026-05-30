import { useEffect, useMemo, useState } from 'react'

const SUITS = ['♠', '♥', '♦', '♣']
const SUIT_COLORS = ['#1e293b', '#dc2626', '#dc2626', '#1e293b']

const BACK_PATTERNS = [
  'linear-gradient(135deg, #1e3a5f 0%, #0c1929 50%, #1a365d 100%)',
  'linear-gradient(135deg, #7f1d1d 0%, #450a0a 50%, #991b1b 100%)',
  'linear-gradient(135deg, #14532d 0%, #052e16 50%, #166534 100%)',
  'linear-gradient(135deg, #581c87 0%, #3b0764 50%, #7e22ce 100%)',
]

export default function CardsAnimation({ pool, winner, spinning, onComplete }) {
  const [phase, setPhase] = useState('deal')

  const layout = useMemo(() => {
    const count = pool.length
    const spread = Math.min(72, Math.max(24, count * 10))
    const start = -spread / 2
    const step = count > 1 ? spread / (count - 1) : 0
    return pool.map((name, i) => ({
      name,
      angle: count > 1 ? start + step * i : 0,
      suit: SUITS[i % 4],
      suitColor: SUIT_COLORS[i % 4],
      back: BACK_PATTERNS[i % BACK_PATTERNS.length],
    }))
  }, [pool])

  useEffect(() => {
    if (!spinning || !winner) return
    setPhase('deal')
    const shuffleTimer = setTimeout(() => setPhase('shuffle'), 900)
    const revealTimer = setTimeout(() => setPhase('reveal'), 2000)
    const doneTimer = setTimeout(() => onComplete?.(), 3400)
    return () => {
      clearTimeout(shuffleTimer)
      clearTimeout(revealTimer)
      clearTimeout(doneTimer)
    }
  }, [pool, winner, spinning, onComplete])

  if (!spinning || !winner) return null

  return (
    <div className="anim-casino-table">
      <div className="anim-casino-rail" />
      <div className="anim-casino-felt">
        {layout.map((card, i) => {
          const isWinner = card.name === winner
          const hidden = phase === 'reveal' && !isWinner
          return (
            <div
              key={card.name}
              className={`anim-casino-card ${phase === 'deal' ? 'anim-casino-card--deal' : ''} ${phase === 'shuffle' ? 'anim-casino-card--shuffle' : ''} ${hidden ? 'anim-casino-card--fold' : ''} ${isWinner && phase === 'reveal' ? 'anim-casino-card--winner' : ''}`}
              style={{
                '--card-angle': `${card.angle}deg`,
                '--card-delay': `${i * 0.06}s`,
                '--card-back': card.back,
              }}
            >
              <div className="anim-casino-card-inner">
                <div
                  className="anim-casino-card-back"
                  style={{ background: card.back }}
                >
                  <span className="anim-casino-pattern">♦♠♥♣</span>
                </div>
                <div className="anim-casino-card-front">
                  <span
                    className="anim-casino-suit"
                    style={{ color: card.suitColor }}
                  >
                    {card.suit}
                  </span>
                  <span className="anim-casino-name">{card.name}</span>
                  <span
                    className="anim-casino-suit anim-casino-suit--bottom"
                    style={{ color: card.suitColor }}
                  >
                    {card.suit}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
