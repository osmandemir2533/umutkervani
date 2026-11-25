import { ACILIYET_OPTIONS } from '../../features/tespit/constants'

/** Liste kartı — index.css .uk-u-* sınıfları (Tailwind bg ezmesin) */
export const URGENCY_CARD: Record<number, string> = {
  0: 'uk-u-0',
  1: 'uk-u-1',
  2: 'uk-u-2',
  3: 'uk-u-3',
  4: 'uk-u-4',
  5: 'uk-u-5',
  6: 'uk-u-6',
  7: 'uk-u-7',
}

export const URGENCY_CHIP: Record<number, string> = {
  0: 'bg-[var(--uk-u0-bg)] text-[var(--uk-u0-text)] border-[var(--uk-u0-border)]',
  1: 'bg-[var(--uk-u1-bg)] text-[var(--uk-u1-text)] border-[var(--uk-u1-border)]',
  2: 'bg-[var(--uk-u2-bg)] text-[var(--uk-u2-text)] border-[var(--uk-u2-border)]',
  3: 'bg-[var(--uk-u3-bg)] text-[var(--uk-u3-text)] border-[var(--uk-u3-border)]',
  4: 'bg-[var(--uk-u4-bg)] text-[var(--uk-u4-text)] border-[var(--uk-u4-border)]',
  5: 'bg-[var(--uk-u5-bg)] text-[var(--uk-u5-text)] border-[var(--uk-u5-border)]',
  6: 'bg-[var(--uk-u6-bg)] text-[var(--uk-u6-text)] border-[var(--uk-u6-border)]',
  7: 'bg-[var(--uk-u7-bg)] text-[var(--uk-u7-text)] border-[var(--uk-u7-border)]',
}

const BADGE: Record<number, string> = {
  0: 'bg-[var(--uk-u0-border)] text-white',
  1: 'bg-[var(--uk-u1-border)] text-white',
  2: 'bg-[var(--uk-u2-border)] text-white',
  3: 'bg-[var(--uk-u3-border)] text-[#1c1917]',
  4: 'bg-[var(--uk-u4-border)] text-white',
  5: 'bg-[var(--uk-u5-border)] text-white',
  6: 'bg-[var(--uk-u6-border)] text-white',
  7: 'bg-[var(--uk-u7-border)] text-white',
}

export function UrgencyBadge({ value, short = true }: { value: number; short?: boolean }) {
  const opt = ACILIYET_OPTIONS.find((o) => o.value === value)
  const color = BADGE[value] ?? BADGE[0]
  const title = opt?.title ?? `${value}. derece`
  const period = opt?.period

  return (
    <span className={`inline-flex shrink-0 items-baseline gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${color}`}>
      <span>{title}</span>
      {!short && period && (
        <span className="text-[10px] font-medium opacity-70">({period})</span>
      )}
    </span>
  )
}

/*
 * وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ
 * "Rabbinizin mağfiretine koşun." (Âl-i İmrân 3/133)
 */
