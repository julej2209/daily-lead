let audioCtx = null

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

export function playBeep(frequency = 880, duration = 0.08, volume = 0.12) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = frequency
    gain.gain.value = volume
    osc.connect(gain)
    gain.connect(ctx.destination)
    const t = ctx.currentTime
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
    osc.start(t)
    osc.stop(t + duration)
  } catch {
    /* ignore */
  }
}

export function playPrinterTick() {
  try {
    const ctx = getCtx()
    const bufferSize = ctx.sampleRate * 0.03
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = ctx.createBufferSource()
    const gain = ctx.createGain()
    source.buffer = buffer
    gain.gain.value = 0.08
    source.connect(gain)
    gain.connect(ctx.destination)
    source.start()
  } catch {
    /* ignore */
  }
}
