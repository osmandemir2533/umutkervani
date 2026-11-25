import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { TespitFormu } from '../../types/database'
import { UrgencyBadge } from '../../shared/components/UrgencyBadge'
import { formatTl, netBakiye, sumRecord } from '../../shared/utils/money'
import { asStringArray } from '../../shared/utils/array'
import { formatKayitNo, kayitNoLookupValues } from '../../shared/utils/kayitNo'
import { decodeKayitParam, kayitPath, looksLikeUuid } from '../../shared/utils/kayitPath'
import { useToast } from '../../shared/toast/ToastContext'
import {
  EV_DURUM_OPTIONS,
  EV_OZELLIK_OPTIONS,
  EV_TIP_OPTIONS,
  GELIR_ALANLARI,
  GIDER_ALANLARI,
} from './constants'
import { emptyGelir, emptyGider, normalizeHastalar } from './formDefaults'
import { downloadTespitPdf } from './printTespitPdf'

/** Eski kayıtlarda karışmış etiketleri doğru bölüme taşı */
function normalizeEvTags(durum: string[], ozellik: string[]) {
  const durumSet = new Set<string>(EV_DURUM_OPTIONS as unknown as string[])
  const ozellikSet = new Set<string>([
    ...(EV_OZELLIK_OPTIONS as unknown as string[]),
    'Bakımsız',
    'Mutfak yok',
    'Mutfaksız',
    'Eski bina',
    'Eski yapı',
    'Yeni bina',
    'Yeni yapı',
    'Kalorifer',
    'Kaloriferli',
    'Soba',
    'Sobalı',
    'Rutubetli',
    'Nemli',
  ])
  const tipSet = new Set<string>(EV_TIP_OPTIONS as unknown as string[])

  const durumOut: string[] = []
  const ozellikOut: string[] = []

  function place(item: string) {
    if (tipSet.has(item)) return
    if (ozellikSet.has(item)) {
      if (!ozellikOut.includes(item)) ozellikOut.push(item)
      return
    }
    if (durumSet.has(item)) {
      if (!durumOut.includes(item)) durumOut.push(item)
      return
    }
    if (!durumOut.includes(item)) durumOut.push(item)
  }

  for (const item of durum) place(item)
  for (const item of ozellik) place(item)

  return { durum: durumOut, ozellik: ozellikOut }
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="uk-card p-4 sm:p-5">
      <h3 className="font-brand mb-3 text-lg font-semibold text-[var(--uk-green)]">{title}</h3>
      {children}
    </section>
  )
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-[var(--uk-muted)]">—</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-[color-mix(in_srgb,var(--uk-green)_14%,transparent)] px-2.5 py-1 text-sm text-[var(--uk-green)]"
        >
          {item}
        </span>
      ))}
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-[color-mix(in_srgb,var(--uk-green)_10%,transparent)] py-2 last:border-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-sm text-[var(--uk-muted)]">{label}</dt>
      <dd className="text-sm font-medium text-[var(--uk-ink)]">{value || '—'}</dd>
    </div>
  )
}

export default function TespitDetailPage() {
  const { kayitNo: kayitNoParam } = useParams()
  const kayitNoKey = decodeKayitParam(kayitNoParam)
  const navigate = useNavigate()
  const { notify } = useToast()
  const [row, setRow] = useState<TespitFormu | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [pdfBusy, setPdfBusy] = useState(false)

  useEffect(() => {
    if (!kayitNoKey) return
    let cancelled = false

    async function load() {
      let data: TespitFormu | null = null
      let errMsg: string | null = null

      if (looksLikeUuid(kayitNoKey)) {
        const res = await supabase.from('tespit_formlari').select('*').eq('id', kayitNoKey).maybeSingle()
        data = (res.data as TespitFormu | null) ?? null
        errMsg = res.error?.message ?? null
      } else {
        const variants = kayitNoLookupValues(kayitNoKey)
        const res = await supabase
          .from('tespit_formlari')
          .select('*')
          .in('kayit_no', variants)
          .limit(1)
          .maybeSingle()
        data = (res.data as TespitFormu | null) ?? null
        errMsg = res.error?.message ?? null
      }

      if (cancelled) return
      if (errMsg || !data) {
        setError(errMsg ?? 'Kayıt bulunamadı')
        setRow(null)
      } else {
        setRow(data)
        const pretty = formatKayitNo(data.kayit_no)
        if (pretty !== '—' && pretty !== kayitNoKey) {
          navigate(kayitPath(data.kayit_no), { replace: true })
        }
      }
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [kayitNoKey, navigate])

  async function handleDelete() {
    if (!row?.id) return
    const ok = window.confirm('Bu kayıt kalıcı olarak silinecek. Emin misiniz?')
    if (!ok) return
    setDeleting(true)
    const { error: err } = await supabase.from('tespit_formlari').delete().eq('id', row.id)
    setDeleting(false)
    if (err) {
      setError(err.message)
      notify('Silinemedi', 'error')
      return
    }
    notify('Kayıt silindi', 'success')
    navigate('/')
  }

  if (loading) return <p className="text-[var(--uk-muted)]">Yükleniyor…</p>
  if (error || !row) {
    return (
      <div className="rounded-xl bg-[var(--uk-u1-bg)] px-4 py-3 text-sm text-[var(--uk-u1-text)]">
        {error ?? 'Kayıt bulunamadı'}
      </div>
    )
  }

  const gelir = { ...emptyGelir(), ...(row.gelir ?? {}) }
  const gider = { ...emptyGider(), ...(row.gider ?? {}) }
  const net = netBakiye(gelir, gider, row.kira_tutari)
  const evTags = normalizeEvTags(row.ev_durum ?? [], row.ev_ozellik ?? [])
  const hastalar = normalizeHastalar(row.hastalar, row)
  const malDiger = asStringArray(row.mal_varligi_diger)
  const saglikDiger = asStringArray(row.saglik_diger)
  const acilNeeds = [
    ...(row.acil_ihtiyac ?? []),
    ...asStringArray(row.acil_ihtiyac_diger),
  ]
  const magduriyetOz = [
    ...(row.magduriyet ?? []),
    ...(row.magduriyet_diger?.trim() ? [`Diğer: ${row.magduriyet_diger.trim()}`] : []),
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--uk-input-border)] bg-[var(--uk-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--uk-muted)]"
        >
          ← Liste
        </Link>
        <UrgencyBadge value={row.aciliyet} short={false} />
      </div>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-brand text-3xl font-bold leading-tight">
            {row.adi_soyadi?.trim() || 'İsimsiz kayıt'}
          </h2>
          <div className="uk-ornament mt-3 w-24" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pdfBusy}
            onClick={() => {
              void (async () => {
                setPdfBusy(true)
                try {
                  await downloadTespitPdf(row)
                  notify('PDF indirildi', 'success')
                } catch {
                  notify('PDF oluşturulamadı. Tekrar deneyin.', 'error')
                } finally {
                  setPdfBusy(false)
                }
              })()
            }}
            className="uk-btn-pdf"
          >
            {pdfBusy ? 'PDF hazırlanıyor…' : 'PDF indir'}
          </button>
          <Link to={kayitPath(row.kayit_no, true)} className="uk-btn-edit">
            Düzenle
          </Link>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="uk-btn-danger"
          >
            {deleting ? 'Siliniyor…' : 'Sil'}
          </button>
        </div>
      </div>

      <section
        className="rounded-[1.25rem] border-2 border-[color-mix(in_srgb,var(--uk-gold)_55%,transparent)] p-4 sm:p-5"
        style={{
          background:
            'linear-gradient(145deg, color-mix(in srgb, var(--uk-gold) 16%, var(--uk-surface)), var(--uk-surface))',
          boxShadow: '0 10px 28px -18px color-mix(in srgb, var(--uk-gold) 45%, transparent)',
        }}
      >
        <h3 className="font-brand mb-3 text-lg font-semibold text-[var(--uk-gold-text)]">
          Düşünceler
        </h3>
        <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--uk-ink)]">
          {row.dusunceler || '—'}
        </p>
      </section>

      <Block title="Özet">
        <dl>
          <Row label="Kayıt no" value={formatKayitNo(row.kayit_no)} />
          <Row label="TC" value={row.tc_kimlik || '—'} />
          <Row label="Mahalle" value={row.mahalle || '—'} />
          <Row label="Telefon" value={row.telefon} />
          <Row label="Görüşülen" value={`${row.gorusulen_kisi || '—'} (${row.gorusulen_yakinlik || '—'})`} />
          <Row label="Adres durumu" value={row.adres_durumu} />
          <Row label="Vakıf görevlisi" value={row.vakif_gorevlisi} />
          <Row label="Tespit tarihi" value={row.tespit_tarihi} />
          <Row label="Net bakiye" value={formatTl(net)} />
          <Row
            label="Acil ihtiyaç"
            value={acilNeeds.length ? <Chips items={acilNeeds} /> : 'Belirtilmedi'}
          />
          <Row
            label="Mağduriyet"
            value={magduriyetOz.length ? <Chips items={magduriyetOz} /> : 'Belirtilmedi'}
          />
        </dl>
      </Block>

      <Block title="Aldığı yardımlar">
        <p className="mb-2 text-sm text-[var(--uk-muted)]">Kurumlar</p>
        <Chips items={row.yardim_kurumlari} />
        {row.yardim_stk_adi && (
          <p className="mt-2 text-sm">STK / Dernek: {row.yardim_stk_adi}</p>
        )}
        {asStringArray(row.yardim_kurumlari_diger).length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-sm text-[var(--uk-gold-text)]">Diğer kurum</p>
            <Chips items={asStringArray(row.yardim_kurumlari_diger)} />
          </div>
        )}
        <p className="mb-2 mt-4 text-sm text-[var(--uk-muted)]">Türler</p>
        <Chips items={row.yardim_turleri} />
        {asStringArray(row.yardim_turleri_diger).length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-sm text-[var(--uk-gold-text)]">Diğer tür</p>
            <Chips items={asStringArray(row.yardim_turleri_diger)} />
          </div>
        )}
      </Block>

      <Block title="Mal varlığı">
        <Chips items={row.mal_varligi} />
        {malDiger.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-sm text-[var(--uk-gold-text)]">Diğer</p>
            <Chips items={malDiger} />
          </div>
        )}
      </Block>

      <Block title="Evdeki eksik eşyalar">
        <Chips items={row.ev_esyalari} />
        {row.ev_esyalari_diger?.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-sm text-[var(--uk-gold-text)]">Diğer eksikler</p>
            <Chips items={row.ev_esyalari_diger} />
          </div>
        )}
      </Block>

      <Block title="Ev durumu">
        <dl>
          <Row
            label="Mülkiyet"
            value={
              row.ev_mulkiyet === 'Diğer' && row.ev_mulkiyet_diger
                ? `Diğer: ${row.ev_mulkiyet_diger}`
                : row.ev_mulkiyet
            }
          />
          {row.ev_mulkiyet === 'Kira' && (
            <Row label="Kira" value={row.kira_tutari != null ? formatTl(row.kira_tutari) : '—'} />
          )}
          <Row
            label="Tip"
            value={
              row.ev_tipi === 'Diğer' && row.ev_tipi_diger
                ? `Diğer: ${row.ev_tipi_diger}`
                : row.ev_tipi
            }
          />
          <Row label="Oda" value={row.oda_sayisi} />
          <Row label="Durum" value={<Chips items={evTags.durum} />} />
          {row.ev_durum_diger && <Row label="Durum diğer" value={row.ev_durum_diger} />}
          <Row label="Özellik" value={<Chips items={evTags.ozellik} />} />
          {row.ev_ozellik_diger?.length > 0 && (
            <Row label="Özellik diğer" value={<Chips items={row.ev_ozellik_diger} />} />
          )}
        </dl>
      </Block>

      <Block title="Gelir / Gider">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Gelir ({formatTl(sumRecord(gelir))})</p>
            <dl>
              {GELIR_ALANLARI.map((a) => (
                <Row key={a.key} label={a.label} value={formatTl(gelir[a.key] || 0)} />
              ))}
            </dl>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Gider ({formatTl(sumRecord(gider))})</p>
            <dl>
              {GIDER_ALANLARI.map((a) => (
                <Row
                  key={a.key}
                  label={a.label}
                  value={formatTl(
                    a.key === 'kira' && row.ev_mulkiyet === 'Kira'
                      ? Number(row.kira_tutari) || Number(gider.kira) || 0
                      : gider[a.key] || 0,
                  )}
                />
              ))}
            </dl>
          </div>
        </div>
      </Block>

      <Block title="Sağlık">
        <Chips items={row.saglik_durumlari} />
        {saglikDiger.length > 0 && (
          <div className="mt-2">
            <p className="mb-1 text-sm text-[var(--uk-gold-text)]">Diğer</p>
            <Chips items={saglikDiger} />
          </div>
        )}

        {hastalar.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium text-[var(--uk-muted)]">Hastalar</p>
            {hastalar.map((h, i) => (
              <div
                key={`${h.adi}-${i}`}
                className="rounded-xl border border-[color-mix(in_srgb,var(--uk-green)_12%,transparent)] px-3 py-2"
              >
                <p className="font-semibold text-[var(--uk-ink)]">{h.adi || `Hasta ${i + 1}`}</p>
                <p className="mt-1 text-sm text-[var(--uk-ink)]">{h.aciklama || '—'}</p>
                <p className="mt-1 text-xs text-[var(--uk-muted)]">
                  Engel: {h.engelli ? `${h.engel_yuzdesi ?? '—'}%` : 'Yok'}
                </p>
              </div>
            ))}
          </div>
        )}

        <dl className="mt-3">
          <Row
            label="Devamlı hasta"
            value={row.devamli_hasta_sayisi ?? row.kronik_hasta_sayisi ?? '—'}
          />
          <Row label="Tıbbi cihaz" value={row.tibbi_cihaz_gerekli ? 'Evet' : 'Hayır'} />
          <Row label="Tıbbi müdahale" value={row.tibbi_mudahale_gerekli ? 'Evet' : 'Hayır'} />
        </dl>
      </Block>

    </div>
  )
}

/*
 * فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ
 * "Kim zerre kadar hayır işlerse onu görür." (Zilzâl 99/7)
 */
