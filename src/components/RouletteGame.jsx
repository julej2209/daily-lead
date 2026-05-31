import { useCallback, useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import {
  AlertCircle,
  Box,
  CircleDot,
  CreditCard,
  Layers,
  LayoutGrid,
  Loader2,
  Settings,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Zap,
} from 'lucide-react'
import PickAnimation from './animations/PickAnimation'
import {
  ANIMATION_MODES,
  ANIMATION_OPTIONS,
  loadAnimationMode,
  saveAnimationMode,
  SPIN_STATUS,
} from '../lib/animationModes'
import {
  appendWinner,
  getCandidates,
  resolveSelection,
} from '../lib/rouletteLogic'
import { updateRouletteState } from '../lib/supabase'
import ScratchAnimation from './animations/ScratchAnimation'

const ICONS = {
  CircleDot,
  Zap,
  LayoutGrid,
  Box,
  Layers,
  Ticket,
  Star,
  CreditCard,
}

function fireConfetti() {
  const duration = 2500
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors: ['#7c3aed', '#3b82f6', '#f59e0b'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors: ['#7c3aed', '#3b82f6', '#f59e0b'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.55 },
  })
}

export default function RouletteGame({
  participants,
  absent,
  currentWinner,
  lastWinners,
  onStateUpdated,
  onGoToSettings,
  onError,
  onWarning,
}) {
  const [displayName, setDisplayName] = useState('')
  const [phase, setPhase] = useState(() =>
    currentWinner ? 'result' : 'idle',
  )
  const [animationMode, setAnimationMode] = useState(loadAnimationMode)
  const [spinPool, setSpinPool] = useState([])
  const [pendingWinner, setPendingWinner] = useState('')
  const [showNoCandidates, setShowNoCandidates] = useState(false)
  const [resettingHistory, setResettingHistory] = useState(false)
  const [resultVisible, setResultVisible] = useState(false)
  const [pickVisualSnapshot, setPickVisualSnapshot] = useState(null)
  const timersRef = useRef([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => () => clearTimers(), [clearTimers])

  useEffect(() => {
    if (phase === 'spinning' || phase === 'preparing') return
    if (currentWinner) {
      setDisplayName(currentWinner)
      setPhase('result')
      setResultVisible(true)
    } else if (phase === 'result') {
      setPhase('idle')
      setDisplayName('')
      setResultVisible(false)
    }
  }, [currentWinner, phase])

  function handleAnimationModeChange(mode) {
    setAnimationMode(mode)
    saveAnimationMode(mode)
  }

  const candidates = getCandidates(participants, absent, lastWinners)

  const showResult = useCallback((winner, skipConfetti = false) => {
    setPickVisualSnapshot(null)
    setDisplayName(winner)
    setPhase('result')
    setResultVisible(false)
    setPendingWinner('')
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setResultVisible(true))
    })
    if (!skipConfetti) fireConfetti()
  }, [])

  async function persistWinner(winner, cleanedHistory) {
    const history = cleanedHistory ?? lastWinners
    const nextHistory = appendWinner(history, winner)
    const next = await updateRouletteState({
      current_winner: winner,
      last_winners: nextHistory,
    })
    onStateUpdated?.(next)
    return winner
  }

  function runPickAnimation(winner, pool) {
    setSpinPool(pool)
    setPendingWinner(winner)
    setPhase('spinning')
  }

  const handleAnimationComplete = useCallback(() => {
    if (pendingWinner) {
      const skipConfetti =
        animationMode === ANIMATION_MODES.ticket ||
        animationMode === ANIMATION_MODES.stars
      showResult(pendingWinner, skipConfetti)
    }
  }, [pendingWinner, showResult, animationMode])

  async function handlePick() {
    if (phase === 'spinning' || phase === 'preparing') return
    clearTimers()
    setPickVisualSnapshot({
      lastWinners: [...lastWinners],
      currentWinner: currentWinner || '',
    })
    setPhase('preparing')
    setDisplayName('')
    setResultVisible(false)
    setPendingWinner('')

    const selection = resolveSelection(participants, absent, lastWinners)

    if (selection.type === 'none') {
      setPickVisualSnapshot(null)
      setPhase('idle')
      setShowNoCandidates(true)
      return
    }

    setShowNoCandidates(false)
    const { winner, pool, cleanedHistory, warning, skipAnimation } = selection

    if (warning) {
      onWarning?.(warning)
    }

    try {
      if (cleanedHistory.length !== lastWinners.length) {
        await updateRouletteState({ last_winners: cleanedHistory })
      }

      if (skipAnimation || pool.length === 1) {
        await persistWinner(winner, cleanedHistory)
        showResult(winner)
        return
      }

      await persistWinner(winner, cleanedHistory)
      runPickAnimation(winner, pool)
    } catch (e) {
      setPickVisualSnapshot(null)
      setPhase(currentWinner ? 'result' : 'idle')
      onError?.(e.message || 'Ошибка при выборе ведущего')
    }
  }

  async function handleResetHistory() {
    setResettingHistory(true)
    try {
      const next = await updateRouletteState({
        last_winners: [],
        current_winner: '',
      })
      onStateUpdated?.(next)
      setShowNoCandidates(false)
      setPickVisualSnapshot(null)
      setPhase('idle')
      setDisplayName('')
      setResultVisible(false)
    } catch (e) {
      onError?.(e.message || 'Не удалось сбросить историю')
    } finally {
      setResettingHistory(false)
    }
  }

  const isSpinning = phase === 'spinning'
  const isPreparing = phase === 'preparing'
  const isResult = phase === 'result'
  const selectedHost = displayName || currentWinner || ''
  const showSelectedHighlight = isResult && Boolean(selectedHost)
  const isSelecting = isPreparing || isSpinning
  const displayedLastWinners =
    isSelecting && pickVisualSnapshot
      ? pickVisualSnapshot.lastWinners
      : lastWinners
  const participantVisual = isSelecting && pickVisualSnapshot
    ? pickVisualSnapshot
    : { lastWinners, currentWinner: currentWinner || '' }
  const showPickAnimation =
    isSpinning && spinPool.length > 0 && Boolean(pendingWinner)

  return (
    <div className="space-y-6">
      {displayedLastWinners.length > 0 && (
        <aside className="rounded-xl border border-amber-100 bg-amber-50/80 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Trophy className="h-4 w-4 shrink-0" aria-hidden />
            <p className="text-sm font-medium">Последние ведущие</p>
          </div>
          <p className="mt-1 text-sm text-amber-900/80">
            {displayedLastWinners.join(' · ')} — не участвуют в следующем выборе
          </p>
        </aside>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Анимация выбора
        </p>
        <div className="grid max-h-44 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">
          {ANIMATION_OPTIONS.map(({ id, label, icon }) => {
            const Icon = ICONS[icon]
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleAnimationModeChange(id)}
                disabled={isSpinning || isPreparing}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-medium transition sm:text-sm ${
                  animationMode === id
                    ? 'bg-violet-600 text-white shadow'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                } disabled:opacity-50`}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-violet-50/40 p-6 shadow-sm sm:p-10">
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center sm:min-h-[280px]">
          {(phase === 'idle' || isPreparing) && !showPickAnimation && (
            <>
              <Sparkles
                className="mb-4 h-12 w-12 text-violet-400"
                aria-hidden
              />
              <p className="text-lg text-slate-600">
                Готовы выбрать ведущего?
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Доступно кандидатов:{' '}
                <span className="font-semibold text-violet-700">
                  {candidates.length}
                </span>
              </p>
            </>
          )}

          {showPickAnimation && (
            <div className="mb-4 w-full">
              <PickAnimation
                mode={animationMode}
                pool={spinPool}
                winner={pendingWinner}
                spinning={isSpinning}
                onComplete={handleAnimationComplete}
              />
            </div>
          )}

          {isResult && !showPickAnimation && (
            <p
              className={`max-w-full break-words text-3xl font-bold tracking-tight text-violet-700 sm:text-5xl ${
                resultVisible ? 'animate-result-pop' : 'scale-75 opacity-0'
              }`}
            >
              {displayName}
            </p>
          )}

          {isResult && (
            <p className="mt-4 text-base font-medium text-slate-600">
              Сегодня ведёт встречу
            </p>
          )}
        </div>

        {(phase === 'idle' || isResult) && !isSpinning && !isPreparing && (
          <button
            type="button"
            onClick={handlePick}
            disabled={participants.length === 0 || isPreparing}
            className="mx-auto mt-2 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:from-violet-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="h-6 w-6" aria-hidden />
            Выбрать ведущего
          </button>
        )}

        {isPreparing && !isSpinning && (
          <p className="mt-6 text-center text-sm text-slate-500">
            <Loader2
              className="mr-1 inline h-4 w-4 animate-spin"
              aria-hidden
            />
            Подготовка…
          </p>
        )}

        {isSpinning && (
          <p className="mt-6 text-center text-sm text-slate-500">
            <Loader2
              className="mr-1 inline h-4 w-4 animate-spin"
              aria-hidden
            />
            {SPIN_STATUS[animationMode] || 'Выбираем…'}
          </p>
        )}

        {isResult && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onGoToSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 py-3 font-medium text-white transition hover:bg-slate-900"
            >
              <Settings className="h-5 w-5" aria-hidden />
              Изменить список
            </button>
          </div>
        )}
      </div>

      {participants.length > 0 && (
        <section>
          <h3 className="mb-2 text-sm font-medium text-slate-500">
            Участники сейчас
          </h3>
          <ul className="flex flex-wrap gap-2">
            {participants.map((name) => {
              const isAbsent = absent.includes(name)
              const isCurrentHost =
                isSelecting
                  ? name === participantVisual.currentWinner
                  : showSelectedHighlight && name === selectedHost
              const excluded =
                participantVisual.lastWinners.includes(name) &&
                name !== participantVisual.currentWinner
              return (
                <li
                  key={name}
                  className={`rounded-full px-3 py-1 text-sm transition ${
                    isCurrentHost
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-md ring-2 ring-violet-300 ring-offset-1'
                      : isAbsent
                        ? 'bg-slate-200 text-slate-400 line-through'
                        : excluded
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-violet-100 text-violet-800'
                  }`}
                >
                  {name}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {showNoCandidates && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="no-candidates-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-6 w-6 shrink-0 text-amber-500"
                aria-hidden
              />
              <div>
                <h2
                  id="no-candidates-title"
                  className="text-lg font-semibold text-slate-800"
                >
                  Некого выбирать!
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Проверьте список участников, отметки «Отсутствует» или
                  сбросьте историю последних ведущих.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowNoCandidates(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Закрыть
              </button>
              <button
                type="button"
                onClick={handleResetHistory}
                disabled={resettingHistory}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {resettingHistory && (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                )}
                Сбросить историю
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
