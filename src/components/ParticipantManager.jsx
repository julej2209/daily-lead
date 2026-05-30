import { useEffect, useState } from 'react'
import { Loader2, Save, Users } from 'lucide-react'
import {
  parseParticipantText,
} from '../lib/rouletteLogic'
import { updateRouletteState } from '../lib/supabase'

export default function ParticipantManager({
  participants,
  absent,
  lastWinners,
  onStateUpdated,
  onError,
}) {
  const [draftText, setDraftText] = useState('')
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    setDraftText(participants.join('\n'))
  }, [participants])

  async function handleUpdateList() {
    const names = parseParticipantText(draftText)
    if (names.length === 0) {
      onError?.('Добавьте хотя бы одно имя (каждое с новой строки).')
      return
    }

    const unique = [...new Set(names)]

    setSaving(true)
    try {
      const next = await updateRouletteState({
        participants: unique,
        absent: [],
        last_winners: [],
        current_winner: '',
      })
      onStateUpdated?.(next)
    } catch (e) {
      onError?.(e.message || 'Не удалось обновить список')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAbsent(name, isAbsent) {
    setToggling(name)
    const nextAbsent = isAbsent
      ? [...absent, name]
      : absent.filter((n) => n !== name)

    try {
      const next = await updateRouletteState({ absent: nextAbsent })
      onStateUpdated?.(next)
    } catch (e) {
      onError?.(e.message || 'Не удалось обновить статус')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-slate-700">
          <Users className="h-5 w-5 text-violet-600" aria-hidden />
          <h2 className="text-lg font-semibold">Список участников</h2>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          Вставьте имена — каждое с новой строки. При обновлении списка
          сбрасываются отметки «Отсутствует» и история последних ведущих.
        </p>
        <textarea
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          rows={8}
          placeholder={'Иван Иванов\nМария Петрова\n...'}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none ring-violet-500/0 transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/15"
        />
        <button
          type="button"
          onClick={handleUpdateList}
          disabled={saving}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-base font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Save className="h-5 w-5" aria-hidden />
          )}
          Обновить список
        </button>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
          Участники ({participants.length})
        </h3>
        {participants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-slate-500">
            Список пуст. Добавьте имена выше и нажмите «Обновить список».
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {participants.map((name) => {
              const isAbsent = absent.includes(name)
              const inHistory = lastWinners.includes(name)
              const busy = toggling === name

              return (
                <li
                  key={name}
                  className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                    isAbsent
                      ? 'border-slate-200 bg-slate-100'
                      : 'border-slate-200 bg-white shadow-sm'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={`block truncate text-base font-medium ${
                        isAbsent
                          ? 'text-slate-400 line-through'
                          : 'text-slate-800'
                      }`}
                    >
                      {name}
                    </span>
                    {inHistory && !isAbsent && (
                      <span className="mt-0.5 block text-xs text-amber-600">
                        Недавний ведущий — не участвует в выборе
                      </span>
                    )}
                  </div>
                  <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={isAbsent}
                      disabled={busy}
                      onChange={(e) => toggleAbsent(name, e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                    />
                    <span className="whitespace-nowrap">Отсутствует</span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
