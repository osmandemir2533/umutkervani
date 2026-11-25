import type { GelirDurumu, GiderDurumu } from '../../types/database'

/** 1.000 / 1.000,50 / 1000,5 gibi girişleri sayıya çevirir */
export function parseMoneyInput(raw: string | number | null | undefined): number {
  if (raw == null || raw === '') return 0
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0

  const cleaned = String(raw).trim().replace(/\s/g, '')
  if (!cleaned) return 0

  if (cleaned.includes(',') && cleaned.includes('.')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (cleaned.includes(',')) {
    return Number(cleaned.replace(/\./g, '').replace(',', '.')) || 0
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    return Number(cleaned.replace(/\./g, '')) || 0
  }
  return Number(cleaned) || 0
}

export function sumRecord(record: GelirDurumu | GiderDurumu): number {
  return Object.values(record).reduce((acc, n) => acc + (Number(n) || 0), 0)
}

/** Giderdeki kira ile ev kira tutarının büyüğünü kullanır */
export function toplamGider(gider: GiderDurumu, kiraTutari?: number | null): number {
  const base = sumRecord(gider)
  const giderKira = Number(gider.kira) || 0
  const evKira = Number(kiraTutari) || 0
  const kira = Math.max(giderKira, evKira)
  return base - giderKira + kira
}

export function netBakiye(
  gelir: GelirDurumu,
  gider: GiderDurumu,
  kiraTutari?: number | null,
): number {
  return sumRecord(gelir) - toplamGider(gider, kiraTutari)
}

export function formatTl(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
  }).format(amount)
}

/*
 * وَآتُوا حَقَّهُ يَوْمَ حَصَادِهِ
 * "Hasat günü hakkını verin." (En'âm 6/141)
 */
