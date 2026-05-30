import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Задайте VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY в файле .env',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
)

export const STATE_ROW_ID = 1

export const defaultState = {
  participants: [],
  absent: [],
  current_winner: '',
  last_winners: [],
}

export async function fetchRouletteState() {
  const { data, error } = await supabase
    .from('roulette_state')
    .select('participants, absent, current_winner, last_winners')
    .eq('id', STATE_ROW_ID)
    .single()

  if (error) throw error
  return {
    participants: data.participants ?? [],
    absent: data.absent ?? [],
    current_winner: data.current_winner ?? '',
    last_winners: data.last_winners ?? [],
  }
}

export async function updateRouletteState(patch) {
  const { data, error } = await supabase
    .from('roulette_state')
    .update(patch)
    .eq('id', STATE_ROW_ID)
    .select('participants, absent, current_winner, last_winners')
    .single()

  if (error) throw error
  return {
    participants: data.participants ?? [],
    absent: data.absent ?? [],
    current_winner: data.current_winner ?? '',
    last_winners: data.last_winners ?? [],
  }
}

export function subscribeRouletteState(onChange) {
  const channel = supabase
    .channel('roulette_state_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'roulette_state',
        filter: `id=eq.${STATE_ROW_ID}`,
      },
      async () => {
        try {
          const state = await fetchRouletteState()
          onChange(state)
        } catch (e) {
          console.error('Ошибка синхронизации:', e)
        }
      },
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
