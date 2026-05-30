import { useEffect, useState } from 'react'

const FACE_ICONS = ['★', '◆', '●', '▲', '✦', '♦']

export default function DiceAnimation({ winner, spinning, onComplete }) {
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    setSettled(false)
    const timer = setTimeout(() => {
      setSettled(true)
      setTimeout(() => onComplete?.(), 800)
    }, 2000)
    return () => clearTimeout(timer)
  }, [winner, spinning, onComplete])

  if (!spinning || !winner) return null

  return (
    <div className="anim-dice-scene">
      <div
        className={`anim-dice-cube ${settled ? 'anim-dice-cube--settled' : 'anim-dice-cube--spin'}`}
      >
        <div className="anim-dice-face anim-dice-face--front">{FACE_ICONS[0]}</div>
        <div className="anim-dice-face anim-dice-face--back">{FACE_ICONS[1]}</div>
        <div className="anim-dice-face anim-dice-face--right">{FACE_ICONS[2]}</div>
        <div className="anim-dice-face anim-dice-face--left">{FACE_ICONS[3]}</div>
        <div className="anim-dice-face anim-dice-face--top anim-dice-face--winner">
          {settled ? (
            <span className="anim-dice-winner-name">{winner}</span>
          ) : (
            FACE_ICONS[4]
          )}
        </div>
        <div className="anim-dice-face anim-dice-face--bottom">{FACE_ICONS[5]}</div>
      </div>
    </div>
  )
}
