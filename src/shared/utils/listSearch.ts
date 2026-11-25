/** Liste araması: isim (bitişik / büyük-küçük) + telefon (+90 / 05 / boşluk) + TC (kısa rakamla karışmaz) */

/** TR küçük harf, boşluk ve noktalama yok */
export function normalizeName(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]+/gu, '')
}

/**
 * Telefonu karşılaştırılabilir haneye indirger.
 * +90 / 90 / baştaki 0 / boşluk / tire temizlenir → örn. 5391234567
 */
export function normalizePhoneDigits(value: string): string {
  let d = value.replace(/\D/g, '')
  if (!d) return ''
  if (d.startsWith('90') && d.length >= 12) d = d.slice(2)
  if (d.startsWith('0') && d.length >= 10) d = d.slice(1)
  return d
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Satır, arama metniyle eşleşiyor mu?
 * - İsim: boşluksuz, TR locale
 * - Telefon: en az 3 hane sorgu; +90 / 05 / bitişik fark etmez
 * - TC: en az 7 hane (kısa “539” gibi sorgular TC’ye yapışmaz)
 */
export function rowMatchesSearch(
  queryRaw: string,
  row: { adi_soyadi?: string | null; telefon?: string | null; tc_kimlik?: string | null },
): boolean {
  const query = queryRaw.trim()
  if (!query) return true

  const nameQ = normalizeName(query)
  const nameHay = normalizeName(row.adi_soyadi ?? '')
  if (nameQ && nameHay.includes(nameQ)) return true

  const qDigits = normalizePhoneDigits(query)
  const rawDigits = digitsOnly(query)

  // Telefon: normalize edilmiş sorgunun telefon içinde geçmesi
  if (qDigits.length >= 3) {
    const phone = normalizePhoneDigits(row.telefon ?? '')
    if (phone && phone.includes(qDigits)) return true
  }

  // TC: yeterince uzun rakam dizisi (telefon kısaltmasıyla karışmasın)
  if (rawDigits.length >= 7) {
    const tc = digitsOnly(row.tc_kimlik ?? '')
    if (tc && tc.includes(rawDigits)) return true
  }

  return false
}
