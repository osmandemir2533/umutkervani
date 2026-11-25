import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('xxxxx') &&
    !supabaseAnonKey.includes('eyJhbGciOi...') &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20,
)

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase ayarları eksik veya geçersiz. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.',
  )
}

/** Supabase istemcisi — giriş + veritabanı */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  },
)

/*
 * وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ
 * "Namazı kılın, zekâtı verin." (Bakara 2/43)
 */
