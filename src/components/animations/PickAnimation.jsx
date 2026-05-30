import { ANIMATION_MODES } from '../../lib/animationModes'
import FortuneWheel from '../FortuneWheel'
import SlotAnimation from './SlotAnimation'
import DiceAnimation from './DiceAnimation'
import CarouselAnimation from './CarouselAnimation'
import TicketAnimation from './TicketAnimation'
import StarsAnimation from './StarsAnimation'
import CardsAnimation from './CardsAnimation'
import NamesAnimation from './NamesAnimation'

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
    case ANIMATION_MODES.slot:
      return <SlotAnimation {...props} />
    case ANIMATION_MODES.dice:
      return <DiceAnimation {...props} />
    case ANIMATION_MODES.carousel:
      return <CarouselAnimation {...props} />
    case ANIMATION_MODES.ticket:
      return <TicketAnimation {...props} />
    case ANIMATION_MODES.stars:
      return <StarsAnimation {...props} />
    case ANIMATION_MODES.cards:
      return <CardsAnimation {...props} />
    default:
      return <NamesAnimation {...props} />
  }
}
