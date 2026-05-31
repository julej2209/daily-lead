export const ANIMATION_MODES = {
  wheel: 'wheel',
  names: 'names',
  dice: 'dice',
  stars: 'stars',
  cards: 'cards',
  scratch: 'scratch',
  // ticket, slot, carousel удалены, так как файлов больше нет
}

export const REMOVED_MODES = ['ticker', 'pulse', 'film', 'ticket', 'slot', 'carousel']

export const STORAGE_KEY = 'roulette-animation-mode'

export const ANIMATION_OPTIONS = [
  { id: ANIMATION_MODES.wheel, label: 'Колесо фортуны', icon: 'CircleDot' },
  { id: ANIMATION_MODES.names, label: 'Имена', icon: 'Zap' },
  { id: ANIMATION_MODES.dice, label: '3D Кубик', icon: 'Box' },
  { id: ANIMATION_MODES.stars, label: 'Звёздное небо', icon: 'Star' },
  { id: ANIMATION_MODES.cards, label: 'Карты', icon: 'CreditCard' },
  { id: ANIMATION_MODES.scratch, label: 'Скретч-карта', icon: 'Eraser' },
]

export function loadAnimationMode() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && REMOVED_MODES.includes(saved)) return ANIMATION_MODES.wheel
    if (saved && Object.values(ANIMATION_MODES).includes(saved)) return saved
  } catch {
    /* ignore */
  }
  return ANIMATION_MODES.wheel
}

export function saveAnimationMode(mode) {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

export const SPIN_STATUS = {
  [ANIMATION_MODES.wheel]: 'Крутим колесо…',
  [ANIMATION_MODES.names]: 'Мелькают имена…',
  [ANIMATION_MODES.dice]: 'Бросаем кубик…',
  [ANIMATION_MODES.stars]: 'Стягиваем звёзды…',
  [ANIMATION_MODES.cards]: 'Раскладываем карты…',
  [ANIMATION_MODES.scratch]: 'Скретчим карту…',
}

export const CAROUSEL_COLORS = [
  '#7c3aed',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
  '#f97316',
]