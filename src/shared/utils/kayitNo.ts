/** Tarih + saate göre sıralı kayıt no: 20261124-135201 */
export function generateKayitNo(date = new Date()): string {
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  const y = date.getFullYear()
  const m = pad(date.getMonth() + 1)
  const d = pad(date.getDate())
  const h = pad(date.getHours())
  const min = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${y}${m}${d}-${h}${min}${s}`
}

/** Eski UK- önekini kaldırır (gösterim / URL) */
export function formatKayitNo(kayitNo: string | null | undefined): string {
  const raw = (kayitNo ?? '').trim()
  if (!raw) return '—'
  return raw.replace(/^UK-/i, '')
}

/** Arama için olası kayıt no varyantları (UK’li / UK’siz) */
export function kayitNoLookupValues(param: string): string[] {
  const raw = param.trim()
  if (!raw) return []
  const stripped = raw.replace(/^UK-/i, '')
  const withUk = stripped ? `UK-${stripped}` : raw
  return [...new Set([raw, stripped, withUk].filter(Boolean))]
}

/*
 * وَكُلُّ شَيْءٍ عِندَهُ بِمِقْدَارٍ
 * "Her şey O'nun katında bir ölçü iledir." (Ra'd 13/8)
 */
