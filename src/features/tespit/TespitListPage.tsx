import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { UrgencyBadge, URGENCY_CARD, URGENCY_CHIP } from '../../shared/components/UrgencyBadge'
import { useToast } from '../../shared/toast/ToastContext'
import { formatKayitNo } from '../../shared/utils/kayitNo'
import { kayitPath } from '../../shared/utils/kayitPath'
import { explainSupabaseError } from '../../shared/utils/supabaseError'
import { rowMatchesSearch } from '../../shared/utils/listSearch'
import { isSupabaseConfigured } from '../../lib/supabase'
import { ACILIYET_OPTIONS } from './constants'

export interface TespitListItem {
  id: string
  kayit_no: string | null
  adi_soyadi: string | null
  mahalle: string | null
  tc_kimlik: string | null
  telefon: string | null
  aciliyet: number
  acil_ihtiyac: string[] | null
  magduriyet: string[] | null
  magduriyet_diger: string | null
  dusunceler: string | null
  created_at: string
}

const PAGE_SIZE = 9

function truncate(text: string, max: number) {
  const t = text.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max).trimEnd()}…`
}

export default function TespitListPage() {
  const { notify } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<TespitListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ title: string; detail: string; setupHint: boolean } | null>(
    null,
  )
  const [q, setQ] = useState('')
  const [aciliyetFilter, setAciliyetFilter] = useState<string>('all')
  const [page, setPage] = useState(1)

  function focusSearchInput() {
    const el = searchRef.current
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => el.focus({ preventScroll: true }), 280)
  }

  useEffect(() => {
    const onFocusSearch = () => focusSearchInput()
    window.addEventListener('uk:focus-search', onFocusSearch)
    return () => window.removeEventListener('uk:focus-search', onFocusSearch)
  }, [])

  useEffect(() => {
    const state = location.state as { focusSearch?: boolean } | null
    if (!state?.focusSearch) return
    focusSearchInput()
    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured) {
        setError({
          title: 'Supabase ayarları eksik',
          detail: '.env dosyasına Project URL ve anon key yazın, ardından sunucuyu yeniden başlatın.',
          setupHint: true,
        })
        setRows([])
        setLoading(false)
        return
      }

      const { data, error: err } = await supabase
        .from('tespit_formlari')
        .select(
          'id, kayit_no, adi_soyadi, mahalle, tc_kimlik, telefon, aciliyet, acil_ihtiyac, magduriyet, magduriyet_diger, dusunceler, created_at',
        )
        .order('aciliyet', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(1000)

      if (cancelled) return
      if (err) {
        const explained = explainSupabaseError(err.message)
        setError(explained)
        setRows([])
        notify(explained.title, 'error')
      } else {
        setRows((data as TespitListItem[]) ?? [])
      }
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [notify])

  const filtered = useMemo(() => {
    const list = rows.filter((row) => {
      if (aciliyetFilter !== 'all' && String(row.aciliyet) !== aciliyetFilter) return false
      return rowMatchesSearch(q, row)
    })
    // 0 → 7 aciliyet; aynı derecede en yeni başta (PC soldan sağa / telefonda yukarıdan aşağı)
    return list.sort((a, b) => {
      if (a.aciliyet !== b.aciliyet) return a.aciliyet - b.aciliyet
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [rows, q, aciliyetFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [q, aciliyetFilter])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, page])

  const pageButtons = useMemo(() => {
    const maxButtons = 5
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const start = Math.max(1, Math.min(page - 2, totalPages - maxButtons + 1))
    return Array.from({ length: maxButtons }, (_, i) => start + i)
  }, [page, totalPages])

  return (
    <div className="space-y-5">
      <div className="uk-fade-up">
        <h2 className="font-brand text-2xl font-bold text-[var(--uk-ink)] sm:text-3xl">Kayıtlar</h2>
        <p className="mt-1 text-sm text-[var(--uk-muted)]">
          
        </p>
        <div className="uk-ornament mt-3 w-28" />
      </div>

      <div className="uk-fade-up-delay space-y-5">
        <div id="uk-search" className="uk-card p-3 sm:p-3.5">
          <input
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="İsim, telefon veya TC ara…"
            className="uk-input text-base"
            enterKeyHint="search"
            autoComplete="off"
            inputMode="search"
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--uk-muted)]">
            Aciliyet filtresi
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-wrap">
            <button
              type="button"
              onClick={() => setAciliyetFilter('all')}
              className={[
                'uk-press rounded-2xl border-2 px-3 py-2.5 text-left sm:shrink-0',
                aciliyetFilter === 'all'
                  ? 'border-[var(--uk-green)] !bg-[var(--uk-green)] !text-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--uk-green)_35%,transparent)]'
                  : 'border-[var(--uk-green)] bg-[var(--uk-surface)] text-[var(--uk-green)]',
              ].join(' ')}
            >
              <span className="block text-xs font-bold">Tümü</span>
              <span
                className={[
                  'mt-0.5 block text-[10px] font-medium',
                  aciliyetFilter === 'all' ? 'text-white/70' : 'text-[var(--uk-muted)]',
                ].join(' ')}
              >
                tüm kayıtlar
              </span>
            </button>
            {ACILIYET_OPTIONS.map((o) => {
              const active = aciliyetFilter === String(o.value)
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setAciliyetFilter(String(o.value))}
                  className={[
                    'uk-press rounded-2xl border-2 px-3 py-2.5 text-left sm:shrink-0',
                    URGENCY_CHIP[o.value],
                    active
                      ? 'scale-[1.02] border-[3px] shadow-[0_0_0_3px_color-mix(in_srgb,currentColor_28%,transparent)] ring-2 ring-[color-mix(in_srgb,currentColor_45%,transparent)] ring-offset-2 ring-offset-[var(--uk-sand)]'
                      : 'opacity-90',
                  ].join(' ')}
                >
                  <span className="block text-xs font-bold leading-tight">{o.title}</span>
                  <span className="mt-0.5 block text-[10px] font-medium opacity-60">
                    ({o.period})
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {loading && (
        <p className="py-8 text-center text-sm text-[var(--uk-muted)]">Kayıtlar yükleniyor…</p>
      )}

      {error && (
        <div className="uk-card border-[color-mix(in_srgb,var(--uk-danger)_25%,transparent)] px-4 py-4 text-sm">
          <p className="font-semibold text-[var(--uk-danger)]">{error.title}</p>
          <p className="mt-1.5 text-[var(--uk-ink)] opacity-90">{error.detail}</p>
          {error.setupHint && (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-[var(--uk-muted)]">
              <li>Supabase SQL Editor’de <code className="font-mono">SETUP.sql</code> çalıştırın</li>
              <li>.env içine URL + anon key yazın</li>
              <li>Authentication → Users’tan kullanıcı ekleyin</li>
              <li>Sayfayı yenileyin</li>
            </ol>
          )}
          <button
            type="button"
            className="mt-4 rounded-xl border border-[var(--uk-input-border)] bg-[var(--uk-surface)] px-3 py-2 text-xs font-bold text-[var(--uk-ink)]"
            onClick={() => window.location.reload()}
          >
            Yenile
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="uk-card border-dashed px-6 py-14 text-center">
          <p className="font-brand text-xl font-semibold text-[var(--uk-ink)]">Henüz kayıt yok</p>
          <p className="mt-2 text-sm text-[var(--uk-muted)]">
            {q.trim() || aciliyetFilter !== 'all'
              ? 'Arama / filtreye uygun kayıt bulunamadı.'
              : 'İlk tespit formunu doldurarak başlayın.'}
          </p>
          {!q.trim() && aciliyetFilter === 'all' && (
            <Link to="/kayit/yeni" className="uk-btn-primary mt-5 inline-flex">
              + Yeni Kayıt
            </Link>
          )}
        </div>
      )}

      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageRows.map((row, index) => {
          const needs = (row.acil_ihtiyac ?? []).join(' · ')
          const magduriyetParts = [
            ...(row.magduriyet ?? []),
            ...(row.magduriyet_diger?.trim() ? [row.magduriyet_diger.trim()] : []),
          ]
          const magduriyetText = magduriyetParts.join(' · ')
          const dusunce = (row.dusunceler ?? '').trim()
          return (
            <li
              key={row.id}
              className="uk-fade-up h-full"
              style={{ animationDelay: `${Math.min(index, 8) * 30}ms` }}
            >
              <Link
                to={kayitPath(row.kayit_no)}
                className={`uk-urgency-card flex h-full flex-col p-4 ${URGENCY_CARD[row.aciliyet] ?? URGENCY_CARD[0]}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-brand truncate text-lg font-bold leading-tight">
                      {row.adi_soyadi?.trim() || 'İsimsiz kayıt'}
                    </p>
                    {row.telefon?.trim() && (
                      <p className="mt-0.5 truncate text-xs opacity-90">Tel: {row.telefon}</p>
                    )}
                    <p className="mt-1 truncate text-xs opacity-80">
                      <span className="font-semibold">Kayıt no:</span> {formatKayitNo(row.kayit_no)}
                    </p>
                  </div>
                  <UrgencyBadge value={row.aciliyet} />
                </div>

                <p className="mt-3 line-clamp-2 text-sm">
                  <span className="font-semibold">Acil ihtiyaç:</span>{' '}
                  {needs ? truncate(needs, 48) : 'Belirtilmedi'}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm">
                  <span className="font-semibold">Mağduriyet:</span>{' '}
                  {magduriyetText ? truncate(magduriyetText, 48) : 'Belirtilmedi'}
                </p>

                {dusunce ? (
                  <p className="mt-auto line-clamp-3 rounded-xl bg-[color-mix(in_srgb,currentColor_10%,transparent)] px-3 py-2 text-sm leading-snug">
                    <span className="font-bold">Düşünce: </span>
                    {truncate(dusunce, 110)}
                  </p>
                ) : (
                  <div className="mt-auto" />
                )}
              </Link>
            </li>
          )
        })}
      </ul>

      {!loading && filtered.length > 0 && (
        <div className="flex flex-col items-center gap-3 pb-2">
          <p className="text-xs text-[var(--uk-muted)]">
            {filtered.length} kayıt · Sayfa {page}/{totalPages}
          </p>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-[var(--uk-input-border)] bg-[var(--uk-surface)] px-3 py-2 text-sm font-semibold text-[var(--uk-ink)] disabled:opacity-40"
              >
                ‹
              </button>
              {pageButtons.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={[
                    'min-w-10 rounded-xl px-3 py-2 text-sm font-bold transition',
                    n === page
                      ? 'bg-[var(--uk-green)] text-white'
                      : 'border border-[var(--uk-input-border)] bg-[var(--uk-surface)] text-[var(--uk-ink)]',
                  ].join(' ')}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-xl border border-[var(--uk-input-border)] bg-[var(--uk-surface)] px-3 py-2 text-sm font-semibold text-[var(--uk-ink)] disabled:opacity-40"
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/*
 * وَيُؤْثِرُونَ عَلَىٰ أَنفُسِهِمْ وَلَوْ كَانَ بِهِمْ خَصَاصَةٌ
 * "Kendileri ihtiyaç içinde olsalar bile onları kendilerine tercih ederler." (Haşr 59/9)
 */
