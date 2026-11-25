import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../auth/AuthContext'
import { CheckboxGroup } from '../../shared/components/CheckboxGroup'
import { formatTl, netBakiye, parseMoneyInput, sumRecord, toplamGider } from '../../shared/utils/money'
import { formatKayitNo, generateKayitNo, kayitNoLookupValues } from '../../shared/utils/kayitNo'
import { decodeKayitParam, kayitPath, looksLikeUuid } from '../../shared/utils/kayitPath'
import { explainSupabaseError } from '../../shared/utils/supabaseError'
import { asStringArray } from '../../shared/utils/array'
import { useToast } from '../../shared/toast/ToastContext'
import type {
  GelirDurumu,
  GiderDurumu,
  HastaKaydi,
  TespitFormu,
  TespitFormuInsert,
} from '../../types/database'
import {
  ACILIYET_OPTIONS,
  ACIL_IHTIYAC_OPTIONS,
  ADRES_DURUM_OPTIONS,
  EV_DURUM_OPTIONS,
  EV_ESYALARI_OPTIONS,
  EV_MULKIYET_OPTIONS,
  EV_OZELLIK_OPTIONS,
  EV_TIP_OPTIONS,
  GELIR_ALANLARI,
  GIDER_ALANLARI,
  MAGDURIYET_OPTIONS,
  MAL_VARLIGI_OPTIONS,
  SAGLIK_DURUM_OPTIONS,
  STK_OPTION,
  YAKINLIK_OPTIONS,
  YARDIM_KURUM_OPTIONS,
  YARDIM_TURU_OPTIONS,
} from './constants'
import { emptyGelir, emptyGider, emptyHasta, emptyTespitForm, normalizeHastalar } from './formDefaults'
import { clearNewFormDraft, loadNewFormDraft, saveNewFormDraft } from './formDraft'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="uk-card space-y-4 p-4 sm:p-5">
      <h3 className="font-brand border-b border-[rgba(15,74,56,0.1)] pb-2 text-lg font-semibold text-[var(--uk-green)]">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

const inputClass = 'uk-input text-base'

export default function TespitFormPage() {
  const { kayitNo: kayitNoParam } = useParams()
  const kayitNoKey = decodeKayitParam(kayitNoParam)
  const isEdit = Boolean(kayitNoKey)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { notify } = useToast()

  const [form, setForm] = useState<TespitFormuInsert>(() => {
    if (isEdit) {
      return { ...emptyTespitForm(), kayit_no: null }
    }
    const draft = loadNewFormDraft()
    if (draft?.form) {
      return {
        ...emptyTespitForm(),
        ...draft.form,
        kayit_no: draft.form.kayit_no || generateKayitNo(),
      }
    }
    return { ...emptyTespitForm(), kayit_no: generateKayitNo() }
  })
  const [recordId, setRecordId] = useState<string | null>(null)
  const [yakinlikSecim, setYakinlikSecim] = useState(() =>
    !isEdit ? (loadNewFormDraft()?.yakinlikSecim ?? '') : '',
  )
  const [yakinlikDiger, setYakinlikDiger] = useState(() =>
    !isEdit ? (loadNewFormDraft()?.yakinlikDiger ?? '') : '',
  )
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftRestored] = useState(() => !isEdit && Boolean(loadNewFormDraft()))

  /** Yeni kayıt: yazılanlar localStorage’a yedeklenir (sekme/telefon arka plan) */
  useEffect(() => {
    if (isEdit) return
    const timer = window.setTimeout(() => {
      saveNewFormDraft(form, yakinlikSecim, yakinlikDiger)
    }, 400)
    return () => window.clearTimeout(timer)
  }, [form, yakinlikSecim, yakinlikDiger, isEdit])

  useEffect(() => {
    if (isEdit || !draftRestored) return
    // info: bilgilendirme; ToastProvider aynı mesajı tekrar eklemez (StrictMode)
    notify(
      'Yarım kalan taslak yüklendi. Sıfırdan başlamak için İptal / Sil’e basın.',
      'info',
    )
    // yalnızca ilk mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        const res = await supabase
          .from('tespit_formlari')
          .select('*')
          .in('kayit_no', kayitNoLookupValues(kayitNoKey))
          .limit(1)
          .maybeSingle()
        data = (res.data as TespitFormu | null) ?? null
        errMsg = res.error?.message ?? null
      }

      if (cancelled) return
      if (errMsg || !data) {
        setError(errMsg ?? 'Kayıt bulunamadı')
        setLoading(false)
        return
      }

      const row = data
      const yakinlik = row.gorusulen_yakinlik ?? ''
      const yakinlikList = YAKINLIK_OPTIONS as readonly string[]
      if (yakinlik && yakinlikList.includes(yakinlik) && yakinlik !== 'Diğer') {
        setYakinlikSecim(yakinlik)
        setYakinlikDiger('')
      } else if (yakinlik) {
        setYakinlikSecim('Diğer')
        setYakinlikDiger(yakinlik.startsWith('Diğer:') ? yakinlik.slice(6).trim() : yakinlik)
      } else {
        setYakinlikSecim('')
        setYakinlikDiger('')
      }

      setRecordId(row.id)
      setForm({
        ...emptyTespitForm(),
        ...row,
        kayit_no: formatKayitNo(row.kayit_no) === '—' ? '' : formatKayitNo(row.kayit_no),
        telefon: row.telefon ?? '',
        magduriyet_diger: row.magduriyet_diger ?? '',
        acil_ihtiyac_diger: asStringArray(row.acil_ihtiyac_diger),
        yardim_stk_adi: row.yardim_stk_adi ?? '',
        yardim_kurumlari_diger: asStringArray(row.yardim_kurumlari_diger),
        yardim_turleri_diger: asStringArray(row.yardim_turleri_diger),
        mal_varligi_diger: asStringArray(row.mal_varligi_diger),
        ev_esyalari_diger: asStringArray(row.ev_esyalari_diger),
        ev_mulkiyet_diger: row.ev_mulkiyet_diger ?? '',
        ev_durum_diger: row.ev_durum_diger ?? '',
        ev_tipi_diger: row.ev_tipi_diger ?? '',
        ev_ozellik_diger: asStringArray(row.ev_ozellik_diger),
        oda_sayisi: row.oda_sayisi != null ? String(row.oda_sayisi) : '',
        gelir: { ...emptyGelir(), ...(row.gelir ?? {}) },
        gider: { ...emptyGider(), ...(row.gider ?? {}) },
        saglik_diger: asStringArray(row.saglik_diger),
        hastalar: normalizeHastalar(row.hastalar, row),
        devamli_hasta_sayisi:
          row.devamli_hasta_sayisi ?? row.kronik_hasta_sayisi ?? null,
        tespit_tarihi: row.tespit_tarihi?.slice(0, 10) ?? '',
      })
      setLoading(false)
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [kayitNoKey])

  function patch<K extends keyof TespitFormuInsert>(key: K, value: TespitFormuInsert[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function patchGelir(key: keyof GelirDurumu, raw: string) {
    setForm((prev) => ({ ...prev, gelir: { ...prev.gelir, [key]: parseMoneyInput(raw) } }))
  }

  function patchGider(key: keyof GiderDurumu, raw: string) {
    setForm((prev) => ({ ...prev, gider: { ...prev.gider, [key]: parseMoneyInput(raw) } }))
  }

  function setKiraTutari(value: number | null) {
    setForm((prev) => ({
      ...prev,
      kira_tutari: value,
      gider: {
        ...prev.gider,
        kira: value ?? 0,
      },
    }))
  }

  function patchHasta(index: number, next: Partial<HastaKaydi>) {
    setForm((prev) => {
      const hastalar = [...(prev.hastalar ?? [])]
      hastalar[index] = { ...hastalar[index], ...next }
      if (next.engelli === false) hastalar[index].engel_yuzdesi = null
      return { ...prev, hastalar }
    })
  }

  function addHasta() {
    setForm((prev) => ({ ...prev, hastalar: [...(prev.hastalar ?? []), emptyHasta()] }))
  }

  function removeHasta(index: number) {
    setForm((prev) => ({
      ...prev,
      hastalar: (prev.hastalar ?? []).filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.dusunceler?.trim()) {
      setError('Düşünceler alanı zorunludur.')
      notify('Düşünceler alanını doldurun', 'error')
      return
    }

    if (!form.vakif_gorevlisi?.trim()) {
      setError('Vakıf görevlisi zorunludur.')
      notify('Vakıf görevlisini yazın', 'error')
      return
    }

    const hastalar = (form.hastalar ?? [])
      .map((h) => ({
        adi: h.adi.trim(),
        aciklama: h.aciklama.trim(),
        engelli: Boolean(h.engelli),
        engel_yuzdesi: h.engelli
          ? h.engel_yuzdesi == null
            ? null
            : Number(h.engel_yuzdesi)
          : null,
      }))
      .filter((h) => h.adi || h.aciklama || h.engelli)

    for (const h of hastalar) {
      if (!h.adi) {
        setError('Her hasta için isim zorunludur.')
        notify('Hasta adı eksik', 'error')
        return
      }
      if (!h.aciklama) {
        setError(`“${h.adi}” için hastalık açıklaması zorunludur.`)
        notify('Hastalık açıklaması zorunlu', 'error')
        return
      }
      if (h.engelli && (h.engel_yuzdesi == null || Number.isNaN(h.engel_yuzdesi))) {
        setError(`“${h.adi}” için engel yüzdesi girin.`)
        notify('Engel yüzdesi eksik', 'error')
        return
      }
    }

    setSaving(true)

    const cleanList = (items: string[]) => items.map((s) => s.trim()).filter(Boolean)

    let yakinlik: string | null = null
    if (yakinlikSecim === 'Diğer') {
      yakinlik = yakinlikDiger.trim() ? `Diğer: ${yakinlikDiger.trim()}` : 'Diğer'
    } else if (yakinlikSecim) {
      yakinlik = yakinlikSecim
    }

    const kiraTutari = form.ev_mulkiyet === 'Kira' ? form.kira_tutari : null
    const gider = {
      ...form.gider,
      kira: form.ev_mulkiyet === 'Kira' ? Number(kiraTutari) || 0 : Number(form.gider.kira) || 0,
    }

    const payload: TespitFormuInsert = {
      ...form,
      tc_kimlik: form.tc_kimlik.trim() || '',
      adi_soyadi: form.adi_soyadi.trim() || '',
      mahalle: form.mahalle?.trim() || null,
      telefon: form.telefon?.trim() || null,
      kayit_no: formatKayitNo(form.kayit_no?.trim() || '') === '—'
        ? generateKayitNo()
        : formatKayitNo(form.kayit_no),
      gorusulen_yakinlik: yakinlik,
      oda_sayisi: form.oda_sayisi?.trim() || null,
      dusunceler: form.dusunceler.trim(),
      vakif_gorevlisi: form.vakif_gorevlisi?.trim() || null,
      gelir: { ...emptyGelir(), ...form.gelir },
      gider,
      magduriyet_diger: form.magduriyet.includes('Diğer')
        ? form.magduriyet_diger?.trim() || null
        : null,
      acil_ihtiyac_diger: form.acil_ihtiyac.includes('Diğer')
        ? cleanList(form.acil_ihtiyac_diger)
        : [],
      yardim_stk_adi: form.yardim_kurumlari.includes(STK_OPTION)
        ? form.yardim_stk_adi?.trim() || null
        : null,
      yardim_kurumlari_diger: form.yardim_kurumlari.includes('Diğer')
        ? cleanList(form.yardim_kurumlari_diger)
        : [],
      yardim_turleri_diger: form.yardim_turleri.includes('Diğer')
        ? cleanList(form.yardim_turleri_diger)
        : [],
      mal_varligi_diger: form.mal_varligi.includes('Diğer')
        ? cleanList(form.mal_varligi_diger)
        : [],
      ev_esyalari_diger: form.ev_esyalari.includes('Diğer')
        ? cleanList(form.ev_esyalari_diger)
        : [],
      ev_mulkiyet_diger:
        form.ev_mulkiyet === 'Diğer' ? form.ev_mulkiyet_diger?.trim() || null : null,
      ev_tipi_diger: form.ev_tipi === 'Diğer' ? form.ev_tipi_diger?.trim() || null : null,
      ev_durum_diger: form.ev_durum.includes('Diğer')
        ? form.ev_durum_diger?.trim() || null
        : null,
      ev_ozellik_diger: form.ev_ozellik.includes('Diğer')
        ? cleanList(form.ev_ozellik_diger)
        : [],
      saglik_diger: form.saglik_durumlari.includes('Diğer')
        ? cleanList(form.saglik_diger)
        : [],
      hastalar,
      devamli_hasta_sayisi: form.devamli_hasta_sayisi,
      hasta_adi: null,
      saglik_aciklama: null,
      engel_yuzdesi: null,
      kronik_hasta_sayisi: null,
      kira_tutari: kiraTutari,
      created_by: form.created_by ?? user?.id ?? null,
      updated_at: new Date().toISOString(),
    }

    if (isEdit && recordId) {
      const { error: err } = await supabase
        .from('tespit_formlari')
        .update(payload)
        .eq('id', recordId)
      setSaving(false)
      if (err) {
        const explained = explainSupabaseError(err.message)
        setError(`${explained.title}: ${explained.detail}`)
        notify(explained.title, 'error')
        return
      }
      notify('Kayıt güncellendi', 'success')
      navigate(kayitPath(payload.kayit_no))
      return
    }

    const { data, error: err } = await supabase
      .from('tespit_formlari')
      .insert(payload)
      .select('kayit_no')
      .single()

    setSaving(false)
    if (err) {
      const explained = explainSupabaseError(err.message)
      setError(`${explained.title}: ${explained.detail}`)
      notify(explained.title, 'error')
      return
    }
    clearNewFormDraft()
    notify('Kayıt kaydedildi', 'success')
    navigate(kayitPath((data as { kayit_no: string | null }).kayit_no ?? payload.kayit_no))
  }

  function handleCancelOrClear() {
    if (isEdit) {
      if (form.kayit_no) navigate(kayitPath(form.kayit_no))
      else navigate(-1)
      return
    }
    const ok = window.confirm(
      'Yazılan tüm alanlar ve bu cihazdaki taslak silinecek. Sıfırdan başlamak istediğinize emin misiniz?',
    )
    if (!ok) return
    clearNewFormDraft()
    setForm({ ...emptyTespitForm(), kayit_no: generateKayitNo() })
    setYakinlikSecim('')
    setYakinlikDiger('')
    setError(null)
    notify('Taslak silindi', 'success')
    navigate('/')
  }

  const gelirToplam = sumRecord(form.gelir)
  const giderToplam = toplamGider(form.gider, form.kira_tutari)
  const net = netBakiye(form.gelir, form.gider, form.kira_tutari)

  if (loading) {
    return <p className="text-[var(--uk-muted)]">Form yükleniyor…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {isEdit ? (
          <div>
            <h2 className="font-brand text-2xl font-bold text-[var(--uk-ink)]">Formu Düzenle</h2>
            <div className="uk-ornament mt-3 w-24" />
          </div>
        ) : (
          <Link to="/" className="text-sm font-semibold text-[var(--uk-green)]">
            ← Kayıtlara dön
          </Link>
        )}
        {isEdit && (
          <Link
            to={kayitPath(form.kayit_no || kayitNoKey)}
            className="text-sm font-semibold text-[var(--uk-green)] underline"
          >
            Detaya dön
          </Link>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-[var(--uk-u1-bg)] px-4 py-3 text-sm text-[var(--uk-u1-text)]">{error}</p>
      )}

      <Section title="Üst Bilgiler">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Kayıt No (otomatik)">
            <input
              className={inputClass}
              value={form.kayit_no ?? ''}
              readOnly
              onChange={(e) => patch('kayit_no', e.target.value)}
            />
          </Field>
          <Field label="TC Kimlik No">
            <input
              className={inputClass}
              inputMode="numeric"
              maxLength={11}
              value={form.tc_kimlik}
              onChange={(e) => patch('tc_kimlik', e.target.value.replace(/\D/g, ''))}
            />
          </Field>
          <Field label="Adı Soyadı">
            <input
              className={inputClass}
              value={form.adi_soyadi}
              onChange={(e) => patch('adi_soyadi', e.target.value)}
            />
          </Field>
          <Field label="Telefon">
            <input
              className={inputClass}
              inputMode="tel"
              value={form.telefon ?? ''}
              placeholder="05xx xxx xx xx"
              onChange={(e) => patch('telefon', e.target.value)}
            />
          </Field>
          <Field label="Mahalle">
            <input className={inputClass} value={form.mahalle ?? ''} onChange={(e) => patch('mahalle', e.target.value)} />
          </Field>
          <Field label="Görüşülen şahıs">
            <input
              className={inputClass}
              value={form.gorusulen_kisi ?? ''}
              onChange={(e) => patch('gorusulen_kisi', e.target.value)}
            />
          </Field>
          <div className="space-y-2">
            <Field label="Yakınlığı">
              <select
                className={inputClass}
                value={yakinlikSecim}
                onChange={(e) => {
                  setYakinlikSecim(e.target.value)
                  if (e.target.value !== 'Diğer') setYakinlikDiger('')
                }}
              >
                <option value="">Seçiniz</option>
                {YAKINLIK_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            {yakinlikSecim === 'Diğer' && (
              <Field label="Yakınlık — diğer">
                <input
                  className={inputClass}
                  value={yakinlikDiger}
                  placeholder="Yakınlığı yazın"
                  onChange={(e) => setYakinlikDiger(e.target.value)}
                />
              </Field>
            )}
          </div>
          <Field label="Adres durumu">
            <select
              className={inputClass}
              value={form.adres_durumu ?? ''}
              onChange={(e) => patch('adres_durumu', e.target.value)}
            >
              <option value="">Seçiniz</option>
              {ADRES_DURUM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="1. Mağduriyet">
        <CheckboxGroup
          label="Mağduriyet türleri"
          options={MAGDURIYET_OPTIONS}
          values={form.magduriyet}
          onChange={(v) => patch('magduriyet', v)}
          otherText={form.magduriyet_diger ?? ''}
          onOtherTextChange={(v) => patch('magduriyet_diger', v)}
        />
      </Section>

      <Section title="2. Ailenin Acil İhtiyacı">
        <CheckboxGroup
          label="Acil ihtiyaçlar"
          options={ACIL_IHTIYAC_OPTIONS}
          values={form.acil_ihtiyac}
          onChange={(v) => patch('acil_ihtiyac', v)}
          multiOther={form.acil_ihtiyac_diger.length ? form.acil_ihtiyac_diger : ['']}
          onMultiOtherChange={(v) => patch('acil_ihtiyac_diger', v)}
        />
      </Section>

      <Section title="3. Yardım Aldığı Kurum ve Yardımlar">
        <CheckboxGroup
          label="Kurumlar"
          options={YARDIM_KURUM_OPTIONS}
          values={form.yardim_kurumlari}
          onChange={(v) => patch('yardim_kurumlari', v)}
          exclusiveYok
          multiOther={form.yardim_kurumlari_diger.length ? form.yardim_kurumlari_diger : ['']}
          onMultiOtherChange={(v) => patch('yardim_kurumlari_diger', v)}
          extraFields={[
            {
              when: STK_OPTION,
              label: 'Hangi STK / Dernek?',
              value: form.yardim_stk_adi ?? '',
              onChange: (v) => patch('yardim_stk_adi', v),
              placeholder: 'Dernek / STK adını yazın',
            },
          ]}
        />
        <CheckboxGroup
          label="Aldığı yardım türleri"
          options={YARDIM_TURU_OPTIONS}
          values={form.yardim_turleri}
          onChange={(v) => patch('yardim_turleri', v)}
          exclusiveYok
          multiOther={form.yardim_turleri_diger.length ? form.yardim_turleri_diger : ['']}
          onMultiOtherChange={(v) => patch('yardim_turleri_diger', v)}
        />
      </Section>

      <Section title="4. Mal Varlığı">
        <CheckboxGroup
          label="Mal varlığı"
          options={MAL_VARLIGI_OPTIONS}
          values={form.mal_varligi}
          onChange={(v) => patch('mal_varligi', v)}
          exclusiveYok
          multiOther={form.mal_varligi_diger.length ? form.mal_varligi_diger : ['']}
          onMultiOtherChange={(v) => patch('mal_varligi_diger', v)}
        />
      </Section>

      <Section title="5. Evdeki Eksik Eşyalar">
        <CheckboxGroup
          label="Eksik eşyalar"
          options={EV_ESYALARI_OPTIONS}
          values={form.ev_esyalari}
          onChange={(v) => patch('ev_esyalari', v)}
          multiOther={
            form.ev_esyalari_diger.length ? form.ev_esyalari_diger : ['']
          }
          onMultiOtherChange={(v) => patch('ev_esyalari_diger', v)}
        />
      </Section>

      <Section title="6. Oturduğu Ev ve Fiziki Hali">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Field label="Mülkiyet">
              <select
                className={inputClass}
                value={form.ev_mulkiyet ?? ''}
                onChange={(e) => {
                  const value = e.target.value || null
                  setForm((prev) => ({
                    ...prev,
                    ev_mulkiyet: value,
                    kira_tutari: value === 'Kira' ? prev.kira_tutari : null,
                    gider: {
                      ...prev.gider,
                      kira: value === 'Kira' ? prev.gider.kira : 0,
                    },
                    ev_mulkiyet_diger: value === 'Diğer' ? prev.ev_mulkiyet_diger : '',
                  }))
                }}
              >
                <option value="">Seçiniz</option>
                {EV_MULKIYET_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            {form.ev_mulkiyet === 'Kira' && (
              <Field label="Kira tutarı (TL)">
                <input
                  inputMode="decimal"
                  className={inputClass}
                  placeholder="örn. 1.000 veya 1000"
                  value={form.kira_tutari ?? ''}
                  onChange={(e) =>
                    setKiraTutari(
                      e.target.value === '' ? null : parseMoneyInput(e.target.value),
                    )
                  }
                />
                <p className="text-xs text-[var(--uk-muted)]">
                  Bu tutar giderdeki kira alanına otomatik yazılır.
                </p>
              </Field>
            )}
            {form.ev_mulkiyet === 'Diğer' && (
              <Field label="Mülkiyet — diğer açıklama">
                <input
                  className={inputClass}
                  value={form.ev_mulkiyet_diger ?? ''}
                  placeholder="Diğer nedir?"
                  onChange={(e) => patch('ev_mulkiyet_diger', e.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="space-y-2">
            <Field label="Ev tipi">
              <select
                className={inputClass}
                value={form.ev_tipi ?? ''}
                onChange={(e) => {
                  const value = e.target.value || null
                  patch('ev_tipi', value)
                  if (value !== 'Diğer') patch('ev_tipi_diger', '')
                }}
              >
                <option value="">Seçiniz</option>
                {EV_TIP_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </Field>
            {form.ev_tipi === 'Diğer' && (
              <Field label="Ev tipi — diğer açıklama">
                <input
                  className={inputClass}
                  value={form.ev_tipi_diger ?? ''}
                  placeholder="Diğer nedir?"
                  onChange={(e) => patch('ev_tipi_diger', e.target.value)}
                />
              </Field>
            )}
          </div>

          <Field label="Oda sayısı">
            <input
              type="text"
              className={inputClass}
              placeholder=""
              value={form.oda_sayisi ?? ''}
              onChange={(e) => patch('oda_sayisi', e.target.value)}
            />
          </Field>
        </div>
        <CheckboxGroup
          label="Fiziki durum"
          options={EV_DURUM_OPTIONS}
          values={form.ev_durum}
          onChange={(v) => patch('ev_durum', v)}
          otherText={form.ev_durum_diger ?? ''}
          onOtherTextChange={(v) => patch('ev_durum_diger', v)}
        />
        <CheckboxGroup
          label="Özellikler"
          options={EV_OZELLIK_OPTIONS}
          values={form.ev_ozellik}
          onChange={(v) => patch('ev_ozellik', v)}
          multiOther={form.ev_ozellik_diger.length ? form.ev_ozellik_diger : ['']}
          onMultiOtherChange={(v) => patch('ev_ozellik_diger', v)}
        />
      </Section>

      <Section title="7. Gelir Durumu (aylık TL)">
        <div className="grid gap-3 sm:grid-cols-2">
          {GELIR_ALANLARI.map((alan) => (
            <Field key={alan.key} label={alan.label}>
              <input
                inputMode="decimal"
                className={inputClass}
                placeholder="0"
                value={form.gelir[alan.key] || ''}
                onChange={(e) => patchGelir(alan.key, e.target.value)}
              />
            </Field>
          ))}
        </div>
        <p className="text-sm font-medium text-[var(--uk-green-dark)]">
          Toplam gelir: {formatTl(gelirToplam)}
        </p>
      </Section>

      <Section title="8. Gider Durumu (aylık TL)">
        <div className="grid gap-3 sm:grid-cols-2">
          {GIDER_ALANLARI.map((alan) => {
            const isKira = alan.key === 'kira'
            const kiraFromEv = form.ev_mulkiyet === 'Kira'
            const value = isKira
              ? kiraFromEv
                ? form.kira_tutari || ''
                : ''
              : form.gider[alan.key] || ''
            return (
              <Field key={alan.key} label={alan.label}>
                <input
                  inputMode="decimal"
                  className={`${inputClass}${isKira ? ' cursor-not-allowed opacity-80' : ''}`}
                  placeholder={isKira ? (kiraFromEv ? '0' : 'Ev bölümünden kira seçin') : '0'}
                  value={value}
                  readOnly={isKira}
                  tabIndex={isKira ? -1 : undefined}
                  onChange={(e) => {
                    if (isKira) return
                    patchGider(alan.key, e.target.value)
                  }}
                />
                {isKira && (
                  <p className="text-xs text-[var(--uk-muted)]">
                    {kiraFromEv
                      ? 'Ev kira tutarıyla aynı (otomatik)'
                      : 'Yalnızca “Kira” seçilip tutar girilince dolar — elle yazılamaz'}
                  </p>
                )}
              </Field>
            )
          })}
        </div>
        <p className="text-sm font-medium text-[var(--uk-green-dark)]">
          Toplam gider (kira dahil): {formatTl(giderToplam)} · Net: {formatTl(net)}
        </p>
      </Section>

      <Section title="9. Sağlık Durumu">
        <CheckboxGroup
          label="Hastalık durumu"
          options={SAGLIK_DURUM_OPTIONS}
          values={form.saglik_durumlari}
          onChange={(v) => patch('saglik_durumlari', v)}
          multiOther={form.saglik_diger.length ? form.saglik_diger : ['']}
          onMultiOtherChange={(v) => patch('saglik_diger', v)}
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">Hastalar</p>
            <button
              type="button"
              onClick={addHasta}
              className="rounded-xl border border-[var(--uk-green)] px-3 py-1.5 text-xs font-bold text-[var(--uk-green)]"
            >
              + Hasta ekle
            </button>
          </div>

          {(form.hastalar ?? []).length === 0 && (
            <p className="rounded-xl border border-dashed border-[var(--uk-input-border)] px-3 py-4 text-sm text-[var(--uk-muted)]">
              Henüz hasta eklenmedi. Gerekirse “Hasta ekle” ile ekleyin.
            </p>
          )}

          {(form.hastalar ?? []).map((hasta, index) => (
            <div
              key={index}
              className="space-y-3 rounded-2xl border border-[var(--uk-input-border)] bg-[color-mix(in_srgb,var(--uk-green)_4%,var(--uk-surface))] p-3 sm:p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--uk-green)]">Hasta {index + 1}</p>
                <button
                  type="button"
                  onClick={() => removeHasta(index)}
                  className="text-xs font-semibold text-[var(--uk-danger)]"
                >
                  Kaldır
                </button>
              </div>
              <Field label="Hasta adı">
                <input
                  className={inputClass}
                  value={hasta.adi}
                  onChange={(e) => patchHasta(index, { adi: e.target.value })}
                  placeholder="Ad soyad"
                />
              </Field>
              <Field label="Hastalık açıklaması (zorunlu)">
                <textarea
                  rows={2}
                  className={inputClass}
                  value={hasta.aciklama}
                  onChange={(e) => patchHasta(index, { aciklama: e.target.value })}
                  placeholder="Hastalık / durum açıklaması"
                />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--uk-green)]"
                  checked={hasta.engelli}
                  onChange={(e) => patchHasta(index, { engelli: e.target.checked })}
                />
                Engel durumu var mı?
              </label>
              {hasta.engelli && (
                <Field label="Engel yüzdesi (%)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className={inputClass}
                    value={hasta.engel_yuzdesi ?? ''}
                    onChange={(e) =>
                      patchHasta(index, {
                        engel_yuzdesi:
                          e.target.value === '' ? null : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              )}
            </div>
          ))}
        </div>

        <Field label="Hanedeki devamlı hasta sayısı">
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.devamli_hasta_sayisi ?? ''}
            onChange={(e) =>
              patch(
                'devamli_hasta_sayisi',
                e.target.value === '' ? null : Number(e.target.value),
              )
            }
          />
        </Field>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--uk-green)]"
              checked={form.tibbi_cihaz_gerekli}
              onChange={(e) => patch('tibbi_cihaz_gerekli', e.target.checked)}
            />
            Tıbbi cihaz gerekli mi?
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-[var(--uk-green)]"
              checked={form.tibbi_mudahale_gerekli}
              onChange={(e) => patch('tibbi_mudahale_gerekli', e.target.checked)}
            />
            Tıbbi müdahale gerekli mi?
          </label>
        </div>
      </Section>

      <Section title="Düşünceler ve Aciliyet">
        <Field label="Düşünceler / gözlemler (zorunlu)">
          <textarea
            rows={5}
            className={inputClass}
            value={form.dusunceler ?? ''}
            onChange={(e) => patch('dusunceler', e.target.value)}
            placeholder="Gözlemlerinizi yazın — bu alan zorunludur"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Yardım süresi (Aciliyet)">
            <select
              className={inputClass}
              value={form.aciliyet}
              onChange={(e) => patch('aciliyet', Number(e.target.value))}
            >
              {ACILIYET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vakıf görevlisi (zorunlu)">
            <input
              className={inputClass}
              value={form.vakif_gorevlisi ?? ''}
              onChange={(e) => patch('vakif_gorevlisi', e.target.value)}
              placeholder="Görevi yapan kişinin adı"
              required
            />
          </Field>
          <Field label="Tespit tarihi">
            <input
              type="date"
              className={inputClass}
              value={form.tespit_tarihi ?? ''}
              onChange={(e) => patch('tespit_tarihi', e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <div className="flex flex-col-reverse gap-3 border-t border-[color-mix(in_srgb,var(--uk-green)_12%,transparent)] pt-5 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          onClick={handleCancelOrClear}
          className="uk-btn-ghost w-full px-4 py-3.5 text-sm sm:w-auto sm:min-w-36"
        >
          {isEdit ? 'İptal' : 'İptal / Sil'}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="uk-btn-primary w-full sm:w-auto sm:min-w-44"
        >
          {saving ? 'Kaydediliyor…' : isEdit ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}

/*
 * وَمَا تُنفِقُوا مِنْ خَيْرٍ فَلِأَنفُسِكُمْ
 * "Hayır olarak ne infak ederseniz kendi hayrınızadır." (Bakara 2/272)
 */
