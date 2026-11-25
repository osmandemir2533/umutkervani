import { formatKayitNo } from './kayitNo'

/** Kayıt no ile URL yolu — UUID yerine okunabilir no (UK öneksiz) */
export function kayitPath(kayitNo: string | null | undefined, edit = false): string {
  const raw = formatKayitNo(kayitNo)
  const slug = encodeURIComponent(raw === '—' ? 'yok' : raw)
  return edit ? `/kayit/${slug}/duzenle` : `/kayit/${slug}`
}

export function decodeKayitParam(param: string | undefined): string {
  if (!param) return ''
  try {
    return decodeURIComponent(param)
  } catch {
    return param
  }
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function looksLikeUuid(value: string): boolean {
  return UUID_RE.test(value.trim())
}

/*
 * وَكُلُّ شَيْءٍ عِندَهُ بِمِقْدَارٍ
 * "Her şey O'nun katında bir ölçü iledir." (Ra'd 13/8)
 */
