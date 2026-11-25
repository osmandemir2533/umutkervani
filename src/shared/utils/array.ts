/** DB'den gelen text veya text[] değerini diziye çevirir */
export function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.trim()) return [value]
  return []
}

/*
 * وَكُلُّ شَيْءٍ عِندَهُ بِمِقْدَارٍ
 * "Her şey O'nun katında bir ölçü iledir." (Ra'd 13/8)
 */
