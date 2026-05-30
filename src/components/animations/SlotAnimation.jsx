import { useEffect, useRef, useState } from 'react'
import { playBeep } from '../../lib/sounds'
import { buildReelStrip } from '../../lib/animationHelpers'

const SLOT_H = 56

function Reel({ pool, winner, delay, onStopRef }) {
  const { strip, targetIndex } = buildReelStrip(pool, winner)
  const [offset, setOffset] = useState(0)
  const [spinning, setSpinning] = useState(true)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    setOffset(-SLOT_H * 2)
    setSpinning(true)
    setStopped(false)

    const spinTimer = setTimeout(() => {
      setSpinning(false)
      setOffset(-targetIndex * SLOT_H)
    }, 400 + delay)

    const stopTimer = setTimeout(() => {
      setStopped(true)
      playBeep(600 + delay * 2, 0.1)
      onStopRef.current?.()
    }, 400 + delay + 700)

    return () => {
      clearTimeout(spinTimer)
      clearTimeout(stopTimer)
    }
  }, [pool, winner, delay, targetIndex, onStopRef])

  return (
    <div className="anim-slot-reel">
      <div
        className={`anim-slot-strip ${spinning ? 'anim-slot-strip--blur' : ''}`}
        style={
          spinning
            ? undefined
            : {
                transform: `translateY(${offset + SLOT_H}px)`,
                transition: `transform ${0.55 + delay / 1000}s cubic-bezier(0.17, 0.67, 0.12, 0.99)`,
              }
        }
      >
        {strip.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className={`anim-slot-item ${stopped && name === winner && i === targetIndex ? 'anim-slot-item--win' : ''}`}
          >
            {name.length > 10 ? `${name.slice(0, 9)}…` : name}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SlotAnimation({ pool, winner, spinning, onComplete }) {
  const stopsRef = useRef(0)
  const doneRef = useRef(false)
  const onStopRef = useRef(onComplete)

  onStopRef.current = () => {
    stopsRef.current += 1
    if (stopsRef.current >= 3 && !doneRef.current) {
      doneRef.current = true
      setTimeout(() => onComplete?.(), 600)
    }
  }

  useEffect(() => {
    stopsRef.current = 0
    doneRef.current = false
  }, [pool, winner, spinning])

  if (!spinning || !winner) return null

  return (
    <div className="anim-slot-machine">
      <div className="anim-slot-top" />
      <div className="anim-slot-window">
        {[0, 1, 2].map((i) => (
          <Reel
            key={i}
            pool={pool}
            winner={winner}
            delay={i * 350}
            onStopRef={onStopRef}
          />
        ))}
      </div>
      <div className="anim-slot-lever" aria-hidden />
    </div>
  )
}
