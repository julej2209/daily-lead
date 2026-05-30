import confetti from 'canvas-confetti'

const GOLD = ['#FFD700', '#FFC107', '#FFB300', '#FFE082', '#F9A825', '#FFECB3']

export function fireGoldenConfetti() {
  confetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.45 },
    colors: GOLD,
    ticks: 120,
  })

  const end = Date.now() + 2200
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 270,
      spread: 40,
      startVelocity: 18,
      origin: { x: Math.random(), y: 0 },
      colors: GOLD,
      gravity: 1.1,
      scalar: 0.9,
      drift: 0,
      ticks: 200,
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
