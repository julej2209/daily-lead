import { ANIMATION_MODES } from '../../lib/animationModes'
import FortuneWheel from '../FortuneWheel'
import DiceAnimation from './DiceAnimation'
import StarsAnimation from './StarsAnimation'
import CardsAnimation from './CardsAnimation'
import NamesAnimation from './NamesAnimation'
import ScratchAnimation from './ScratchAnimation'

export default function PickAnimation({
  mode,
  pool,
  winner,
  spinning,
  onComplete,
}) {
  if (!spinning || !winner) return null

  const props = { pool, winner, spinning, onComplete }

  switch (mode) {
    case ANIMATION_MODES.wheel:
      return (
        <FortuneWheel
          candidates={pool}
          winner={winner}
          spinning={spinning}
          onSpinComplete={onComplete}
        />
      )
    case ANIMATION_MODES.names:
      return <NamesAnimation {...props} />
    case ANIMATION_MODES.dice:
      return <DiceAnimation {...props} />
    case ANIMATION_MODES.stars:
      return <StarsAnimation {...props} />
    case ANIMATION_MODES.cards:
      return <CardsAnimation {...props} />
    case ANIMATION_MODES.scratch:
      return <ScratchAnimation winner={winner} onComplete={onComplete} />
    default:
      return <NamesAnimation {...props} />
  }
}