/** Supabase Auth e-posta ister; biz kullanıcı adını buna çeviririz */
export const AUTH_EMAIL_DOMAIN = 'gmail.com'

export function usernameToEmail(username: string): string {
  const raw = username.trim().toLowerCase()
  if (raw.includes('@')) return raw
  return `${raw}@${AUTH_EMAIL_DOMAIN}`
}

/** E-postadan gösterilecek kullanıcı adı */
export function emailToUsername(email: string | null | undefined): string {
  if (!email) return ''
  const local = email.trim().split('@')[0] ?? ''
  return local
}

/*
 * وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ
 * "Hakkında bilgin olmayan şeyin ardına düşme." (İsrâ 17/36)
 */
