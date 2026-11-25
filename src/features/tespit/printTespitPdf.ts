import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { TespitFormu } from '../../types/database'
import { formatTl, netBakiye, sumRecord } from '../../shared/utils/money'
import { asStringArray } from '../../shared/utils/array'
import { formatKayitNo } from '../../shared/utils/kayitNo'
import {
  ACILIYET_OPTIONS,
  EV_DURUM_OPTIONS,
  EV_OZELLIK_OPTIONS,
  EV_TIP_OPTIONS,
  GELIR_ALANLARI,
  GIDER_ALANLARI,
} from './constants'
import { emptyGelir, emptyGider, normalizeHastalar } from './formDefaults'

/** HTML metin kaçışı (form alanları PDF’e basılırken XSS olmasın) */
function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function joinList(items: string[]): string {
  const cleaned = items.map((x) => x.trim()).filter(Boolean)
  return cleaned.length ? cleaned.map(esc).join(', ') : '—'
}

function tr(label: string, value: string): string {
  return `<tr><th>${esc(label)}</th><td>${value || '—'}</td></tr>`
}

function section(title: string, body: string): string {
  return `<section class="block"><h2>${esc(title)}</h2>${body}</section>`
}

/** Eski kayıtlarda karışmış ev etiketlerini ayır (detay sayfasıyla aynı mantık) */
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

function aciliyetLabel(value: number): string {
  return ACILIYET_OPTIONS.find((o) => o.value === value)?.label ?? String(value)
}

const PRINT_CSS = `
  * { box-sizing: border-box; }
  .uk-pdf-root {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    color: #1a1a1a;
    font-size: 11pt;
    line-height: 1.45;
    width: 794px;
    padding: 28px 32px;
    background: #fff;
  }
  header.sheet {
    border-bottom: 2px solid #1f6b4a;
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  header.sheet h1 {
    margin: 0;
    font-size: 1.35rem;
    color: #1f6b4a;
  }
  header.sheet .sub { color: #555; margin-top: 4px; font-size: 0.95rem; }
  .meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px 16px;
    margin-top: 10px;
    font-size: 0.92rem;
  }
  .block { margin: 14px 0; }
  .block h2 {
    margin: 0 0 6px;
    font-size: 1.05rem;
    color: #1f6b4a;
    border-bottom: 1px solid #d7e3d7;
    padding-bottom: 3px;
  }
  table { width: 100%; border-collapse: collapse; }
  th, td {
    text-align: left;
    vertical-align: top;
    padding: 4px 6px;
    border-bottom: 1px solid #ececec;
  }
  th {
    width: 32%;
    color: #555;
    font-weight: 600;
    font-size: 0.9rem;
  }
  .thoughts {
    white-space: pre-wrap;
    background: #fffaf0;
    border: 1px solid #e8d5a8;
    border-radius: 8px;
    padding: 10px 12px;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .muted { color: #666; font-size: 0.9rem; }
  footer.pdf-foot {
    margin-top: 18px;
    padding-top: 8px;
    border-top: 1px solid #ddd;
    font-size: 0.8rem;
    color: #777;
  }
`

/** Kaydın A4 belge gövdesi (HTML) — indirme / önizleme ortak */
export function buildTespitPrintBody(row: TespitFormu): { kayitNo: string; ad: string; html: string } {
  const gelir = { ...emptyGelir(), ...(row.gelir ?? {}) }
  const gider = { ...emptyGider(), ...(row.gider ?? {}) }
  const net = netBakiye(gelir, gider, row.kira_tutari)
  const evTags = normalizeEvTags(row.ev_durum ?? [], row.ev_ozellik ?? [])
  const hastalar = normalizeHastalar(row.hastalar, row)
  const kayitNo = formatKayitNo(row.kayit_no)
  const ad = row.adi_soyadi?.trim() || 'İsimsiz kayıt'

  const acilNeeds = [
    ...(row.acil_ihtiyac ?? []),
    ...asStringArray(row.acil_ihtiyac_diger),
  ]
  const magduriyet = [
    ...(row.magduriyet ?? []),
    ...(row.magduriyet_diger?.trim() ? [`Diğer: ${row.magduriyet_diger.trim()}`] : []),
  ]

  const mulkiyet =
    row.ev_mulkiyet === 'Diğer' && row.ev_mulkiyet_diger
      ? `Diğer: ${row.ev_mulkiyet_diger}`
      : row.ev_mulkiyet || '—'
  const evTipi =
    row.ev_tipi === 'Diğer' && row.ev_tipi_diger
      ? `Diğer: ${row.ev_tipi_diger}`
      : row.ev_tipi || '—'

  const gelirRows = GELIR_ALANLARI.map((a) =>
    tr(a.label, esc(formatTl(gelir[a.key] || 0))),
  ).join('')
  const giderRows = GIDER_ALANLARI.map((a) => {
    const amount =
      a.key === 'kira' && row.ev_mulkiyet === 'Kira'
        ? Number(row.kira_tutari) || Number(gider.kira) || 0
        : gider[a.key] || 0
    return tr(a.label, esc(formatTl(amount)))
  }).join('')

  const hastaHtml =
    hastalar.length === 0
      ? '<p class="muted">Hasta kaydı yok</p>'
      : `<table>${hastalar
          .map((h, i) => {
            const title = h.adi || `Hasta ${i + 1}`
            const engel = h.engelli ? `Evet (${h.engel_yuzdesi ?? '—'}%)` : 'Yok'
            return tr(
              title,
              `${esc(h.aciklama || '—')}<br/><span class="muted">Engel: ${esc(engel)}</span>`,
            )
          })
          .join('')}</table>`

  const generatedAt = new Date().toLocaleString('tr-TR')

  const html = `
  <header class="sheet">
    <h1>Balıkesir Umut Kervanı — Muhtaç Tespit Formu</h1>
    <div class="sub">${esc(ad)}</div>
    <div class="meta">
      <div><strong>Kayıt no:</strong> ${esc(kayitNo)}</div>
      <div><strong>Aciliyet:</strong> ${esc(aciliyetLabel(row.aciliyet))}</div>
      <div><strong>Tespit tarihi:</strong> ${esc(row.tespit_tarihi || '—')}</div>
      <div><strong>Vakıf görevlisi:</strong> ${esc(row.vakif_gorevlisi || '—')}</div>
    </div>
  </header>

  ${section('Düşünceler', `<div class="thoughts">${esc(row.dusunceler || '—')}</div>`)}

  ${section(
    'Özet',
    `<table>
      ${tr('TC', esc(row.tc_kimlik || '—'))}
      ${tr('Mahalle', esc(row.mahalle || '—'))}
      ${tr('Telefon', esc(row.telefon || '—'))}
      ${tr('Görüşülen', esc(`${row.gorusulen_kisi || '—'} (${row.gorusulen_yakinlik || '—'})`))}
      ${tr('Adres durumu', esc(row.adres_durumu || '—'))}
      ${tr('Net bakiye', esc(formatTl(net)))}
      ${tr('Acil ihtiyaç', joinList(acilNeeds))}
      ${tr('Mağduriyet', joinList(magduriyet))}
    </table>`,
  )}

  ${section(
    'Aldığı yardımlar',
    `<table>
      ${tr('Kurumlar', joinList(row.yardim_kurumlari ?? []))}
      ${tr('STK / Dernek', esc(row.yardim_stk_adi || '—'))}
      ${tr('Diğer kurum', joinList(asStringArray(row.yardim_kurumlari_diger)))}
      ${tr('Türler', joinList(row.yardim_turleri ?? []))}
      ${tr('Diğer tür', joinList(asStringArray(row.yardim_turleri_diger)))}
    </table>`,
  )}

  ${section(
    'Mal varlığı',
    `<table>
      ${tr('Mal varlığı', joinList(row.mal_varligi ?? []))}
      ${tr('Diğer', joinList(asStringArray(row.mal_varligi_diger)))}
    </table>`,
  )}

  ${section(
    'Evdeki eksik eşyalar',
    `<table>
      ${tr('Eksikler', joinList(row.ev_esyalari ?? []))}
      ${tr('Diğer', joinList(row.ev_esyalari_diger ?? []))}
    </table>`,
  )}

  ${section(
    'Ev durumu',
    `<table>
      ${tr('Mülkiyet', esc(mulkiyet))}
      ${
        row.ev_mulkiyet === 'Kira'
          ? tr('Kira', esc(row.kira_tutari != null ? formatTl(row.kira_tutari) : '—'))
          : ''
      }
      ${tr('Tip', esc(evTipi))}
      ${tr('Oda', esc(row.oda_sayisi || '—'))}
      ${tr('Durum', joinList(evTags.durum))}
      ${tr('Durum diğer', esc(row.ev_durum_diger || '—'))}
      ${tr('Özellik', joinList(evTags.ozellik))}
      ${tr('Özellik diğer', joinList(row.ev_ozellik_diger ?? []))}
    </table>`,
  )}

  ${section(
    'Gelir / Gider',
    `<div class="grid-2">
      <div>
        <p><strong>Gelir toplam (${esc(formatTl(sumRecord(gelir)))})</strong></p>
        <table>${gelirRows}</table>
      </div>
      <div>
        <p><strong>Gider toplam (${esc(formatTl(sumRecord(gider)))})</strong></p>
        <table>${giderRows}</table>
      </div>
    </div>
    <p style="margin-top:8px"><strong>Net bakiye:</strong> ${esc(formatTl(net))}</p>`,
  )}

  ${section(
    'Sağlık',
    `<table>
      ${tr('Durumlar', joinList(row.saglik_durumlari ?? []))}
      ${tr('Diğer', joinList(asStringArray(row.saglik_diger)))}
      ${tr('Devamlı hasta', esc(String(row.devamli_hasta_sayisi ?? row.kronik_hasta_sayisi ?? '—')))}
      ${tr('Tıbbi cihaz', row.tibbi_cihaz_gerekli ? 'Evet' : 'Hayır')}
      ${tr('Tıbbi müdahale', row.tibbi_mudahale_gerekli ? 'Evet' : 'Hayır')}
    </table>
    <h2 style="margin-top:12px;font-size:1rem;color:#1f6b4a">Hastalar</h2>
    ${hastaHtml}`,
  )}

  <footer class="pdf-foot">
    Belge tarayıcıda oluşturuldu · ${esc(generatedAt)} · Kayıt: ${esc(kayitNo)} ·
    PDF sunucuya / Supabase’e yüklenmez; yalnızca bu cihazda indirilir.
  </footer>`

  return { kayitNo, ad, html }
}

/**
 * Kayda özel PDF’i tarayıcıda üretir ve doğrudan indirir.
 * Yeni sekme açmaz; Supabase Storage’a yazmaz.
 */
export async function downloadTespitPdf(row: TespitFormu): Promise<void> {
  const { kayitNo, html } = buildTespitPrintBody(row)

  const host = document.createElement('div')
  host.setAttribute('aria-hidden', 'true')
  host.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;background:#fff;pointer-events:none;z-index:-1;'
  host.innerHTML = `<style>${PRINT_CSS}</style><div class="uk-pdf-root">${html}</div>`
  document.body.appendChild(host)

  const root = host.querySelector('.uk-pdf-root') as HTMLElement
  try {
    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft > 0.5) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    const safeName = (kayitNo !== '—' ? kayitNo : 'kayit').replace(/[^\w.-]+/g, '_')
    pdf.save(`umut-kervani-tespit-${safeName}.pdf`)
  } finally {
    host.remove()
  }
}
