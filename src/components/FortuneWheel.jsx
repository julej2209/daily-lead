import { useEffect, useRef, useState } from 'react'

const WHEEL_COLORS = [
  '#7c3aed', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#14b8a6', // teal
  '#f97316', // orange
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6366f1', // indigo
]

const SPIN_DURATION_MS = 2600

export default function FortuneWheel({
  candidates,
  winner,
  spinning,
  onSpinComplete,
}) {
  const wheelRef = useRef(null)
  const rotationRef = useRef(0)
  const [rotation, setRotation] = useState(0)
  const [transitionEnabled, setTransitionEnabled] = useState(false)
  const completedRef = useRef(false)

  const count = candidates.length
  const segmentAngle = count > 0 ? 360 / count : 0

  useEffect(() => {
    if (!spinning || !winner || count === 0) return

    completedRef.current = false
    const winnerIndex = candidates.indexOf(winner)
    if (winnerIndex < 0) return

    const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2
    const jitter = (Math.random() - 0.5) * segmentAngle * 0.35
    const extraSpins = 4 + Math.floor(Math.random() * 2)
    const targetRotation =
      rotationRef.current +
      extraSpins * 360 +
      (360 - segmentCenter + jitter)

    rotationRef.current = targetRotation

    setTransitionEnabled(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTransitionEnabled(true)
        setRotation(targetRotation)
      })
    })

    const timer = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true
        onSpinComplete?.()
      }
    }, SPIN_DURATION_MS + 80)

    return () => clearTimeout(timer)
  }, [spinning, winner, candidates, count, segmentAngle, onSpinComplete])

  if (count === 0) return null

  return (
    <div className="relative mx-auto flex w-full max-w-xs items-center justify-center sm:max-w-sm">
      <div
        className="absolute -top-1 z-20 flex flex-col items-center"
        aria-hidden
      >
        <div className="h-0 w-0 border-x-[12px] border-t-[18px] border-x-transparent border-t-violet-600 drop-shadow" />
      </div>

      <div
        ref={wheelRef}
        className="relative aspect-square w-full rounded-full border-4 border-white shadow-xl shadow-violet-500/20"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: transitionEnabled
            ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
            : 'none',
        }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          {candidates.map((name, index) => {
            const startAngle = index * segmentAngle - 90
            const endAngle = startAngle + segmentAngle
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180
            const x1 = 100 + 100 * Math.cos(startRad)
            const y1 = 100 + 100 * Math.sin(startRad)
            const x2 = 100 + 100 * Math.cos(endRad)
            const y2 = 100 + 100 * Math.sin(endRad)
            const largeArc = segmentAngle > 180 ? 1 : 0
            const midAngle = startAngle + segmentAngle / 2
            const midRad = (midAngle * Math.PI) / 180
            const labelR = 62
            const labelX = 100 + labelR * Math.cos(midRad)
            const labelY = 100 + labelR * Math.sin(midRad)
            const color = WHEEL_COLORS[index % WHEEL_COLORS.length]

            return (
              <g key={name}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={color}
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <text
                  x={labelX}
                  y={labelY}
                  fill="#fff"
                  fontSize={count > 8 ? 7 : count > 5 ? 8 : 9}
                  fontWeight="600"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${labelX}, ${labelY})`}
                >
                  {name.length > 14 ? `${name.slice(0, 12)}…` : name}
                </text>
              </g>
            )
          })}
          <circle cx="100" cy="100" r="14" fill="#fff" stroke="#e2e8f0" strokeWidth="2" />
        </svg>
      </div>
    </div>
  )
}
