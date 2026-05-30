export function parseParticipantText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

export function getCandidates(participants, absent, lastWinners) {
  const absentSet = new Set(absent)
  const historySet = new Set(lastWinners)
  return participants.filter(
    (name) => !absentSet.has(name) && !historySet.has(name),
  )
}

export function filterLastWinners(lastWinners, participants) {
  const allowed = new Set(participants)
  return lastWinners.filter((name) => allowed.has(name)).slice(0, 2)
}

export function pickRandom(candidates) {
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function appendWinner(lastWinners, winner) {
  return [winner, ...lastWinners.filter((n) => n !== winner)].slice(0, 2)
}

export function getStatePatchIfStale(
  participants,
  absent,
  currentWinner,
  lastWinners,
) {
  const patch = {}
  const cleanedHistory = filterLastWinners(lastWinners, participants)
  const cleanedAbsent = absent.filter((name) => participants.includes(name))

  if (cleanedHistory.length !== lastWinners.length) {
    patch.last_winners = cleanedHistory
  }
  if (cleanedAbsent.length !== absent.length) {
    patch.absent = cleanedAbsent
  }
  if (currentWinner && !participants.includes(currentWinner)) {
    patch.current_winner = ''
  }

  return Object.keys(patch).length ? patch : null
}

/**
 * Умная логика выбора ведущего.
 * @returns {{ type: 'none'|'resolved'|'random', winner?: string, pool?: string[], cleanedHistory: string[], warning?: string, skipAnimation?: boolean }}
 */
export function resolveSelection(participants, absent, lastWinners) {
  const cleanedHistory = filterLastWinners(lastWinners, participants)
  const absentSet = new Set(absent)
  const present = participants.filter((name) => !absentSet.has(name))

  if (present.length === 0) {
    return { type: 'none', cleanedHistory }
  }

  // Единственный присутствующий — выбирается всегда, даже если недавно вёл
  if (present.length === 1) {
    return {
      type: 'resolved',
      winner: present[0],
      pool: present,
      cleanedHistory,
      skipAnimation: true,
    }
  }

  const pool = getCandidates(participants, absent, cleanedHistory)

  if (pool.length === 0) {
    const previous = cleanedHistory.find((name) => present.includes(name))
    if (previous) {
      return {
        type: 'resolved',
        winner: previous,
        pool: present,
        cleanedHistory,
        warning:
          'Все остальные отсутствуют или недавно уже вели. Выбран предыдущий ведущий.',
        skipAnimation: true,
      }
    }
    return { type: 'none', cleanedHistory }
  }

  if (pool.length === 1) {
    return {
      type: 'resolved',
      winner: pool[0],
      pool,
      cleanedHistory,
      skipAnimation: true,
    }
  }

  return {
    type: 'random',
    winner: pickRandom(pool),
    pool,
    cleanedHistory,
    skipAnimation: false,
  }
}
