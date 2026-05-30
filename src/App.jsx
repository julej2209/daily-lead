import { useCallback, useEffect, useState } from 'react'
import { Loader2, Radio, Settings, Sparkles, Wifi, WifiOff } from 'lucide-react'
import ParticipantManager from './components/ParticipantManager'
import RouletteGame from './components/RouletteGame'
import { getStatePatchIfStale } from './lib/rouletteLogic'
import {
  defaultState,
  fetchRouletteState,
  subscribeRouletteState,
  supabase,
  updateRouletteState,
} from './lib/supabase'

const TABS = {
  game: 'game',
  settings: 'settings',
}

export default function App() {
  const [view, setView] = useState(TABS.game)
  const [state, setState] = useState(defaultState)
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)
  const [warning, setWarning] = useState(null)

  const showError = useCallback((message) => {
    setToast(message)
    setError(message)
    setTimeout(() => setToast(null), 5000)
  }, [])

  const showWarning = useCallback((message) => {
    setWarning(message)
    setTimeout(() => setWarning(null), 6000)
  }, [])

  const applyState = useCallback(async (data) => {
    const patch = getStatePatchIfStale(
      data.participants,
      data.absent,
      data.current_winner,
      data.last_winners,
    )
    if (patch) {
      try {
        const fixed = await updateRouletteState(patch)
        setState(fixed)
        return
      } catch (e) {
        console.error('Не удалось очистить устаревшие данные:', e)
      }
    }
    setState(data)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const data = await fetchRouletteState()
        if (!cancelled) await applyState(data)
      } catch (e) {
        if (!cancelled) {
          showError(
            e.message ||
              'Не удалось загрузить данные. Проверьте .env и таблицу roulette_state.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    const unsubscribe = subscribeRouletteState((next) => {
      applyState(next)
      setConnected(true)
    })

    const channel = supabase.channel('presence_ping')
    channel.subscribe((status) => {
      setConnected(status === 'SUBSCRIBED')
    })

    return () => {
      cancelled = true
      unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [showError, applyState])

  const configured =
    Boolean(import.meta.env.VITE_SUPABASE_URL) &&
    Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY)

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2
          className="h-10 w-10 animate-spin text-violet-600"
          aria-label="Загрузка"
        />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-4 py-6 sm:py-10">
      <header className="mb-8 text-center">
        <div className="mb-2 inline-flex items-center justify-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
          <Radio className="h-4 w-4" aria-hidden />
          Рулетка ведущего
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Кто ведёт сегодня?
        </h1>
        <div
          className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            connected
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {connected ? (
            <Wifi className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <WifiOff className="h-3.5 w-3.5" aria-hidden />
          )}
          {connected ? 'Онлайн' : 'Подключение…'}
        </div>
      </header>

      {!configured && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          Создайте файл <code className="rounded bg-amber-100 px-1">.env</code>{' '}
          по образцу <code className="rounded bg-amber-100 px-1">.env.example</code>{' '}
          с ключами Supabase.
        </div>
      )}

      {warning && (
        <div
          role="status"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          {warning}
        </div>
      )}

      {toast && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {toast}
        </div>
      )}

      <nav
        className="mb-6 flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"
        aria-label="Разделы"
      >
        <button
          type="button"
          onClick={() => setView(TABS.game)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            view === TABS.game
              ? 'bg-violet-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          Рулетка
        </button>
        <button
          type="button"
          onClick={() => setView(TABS.settings)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
            view === TABS.settings
              ? 'bg-violet-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings className="h-4 w-4" aria-hidden />
          Настройки
        </button>
      </nav>

      <main>
        {view === TABS.game ? (
          <RouletteGame
            participants={state.participants}
            absent={state.absent}
            currentWinner={state.current_winner}
            lastWinners={state.last_winners}
            onStateUpdated={setState}
            onGoToSettings={() => setView(TABS.settings)}
            onError={showError}
            onWarning={showWarning}
          />
        ) : (
          <ParticipantManager
            participants={state.participants}
            absent={state.absent}
            lastWinners={state.last_winners}
            onStateUpdated={setState}
            onError={showError}
          />
        )}
      </main>

      {error && view === TABS.game && state.participants.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Перейдите в «Настройки», чтобы добавить участников.
        </p>
      )}

      <footer className="mt-12 text-center text-xs text-slate-400">
        Fair pick · Supabase Realtime
      </footer>
    </div>
  )
}
