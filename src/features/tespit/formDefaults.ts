import type {
  GelirDurumu,
  GiderDurumu,
  HastaKaydi,
  TespitFormuInsert,
} from '../../types/database'

export function emptyGelir(): GelirDurumu {
  return {
    dul_maasi: 0,
    yasli_maasi: 0,
    engelli_maasi: 0,
    ozurlu_maasi: 0,
    issizlik_maasi: 0,
    cocuk_yardimi: 0,
    bakici_ucreti: 0,
    emekli_maasi: 0,
    nafaka: 0,
    kira_geliri: 0,
    maas_ucret: 0,
    diger_gelir: 0,
  }
}

export function emptyGider(): GiderDurumu {
  return {
    kira: 0,
    faturalar: 0,
    okul_gideri: 0,
    gida: 0,
    giyim: 0,
    saglik_gideri: 0,
    diger_gider: 0,
  }
}

export function emptyHasta(): HastaKaydi {
  return {
    adi: '',
    aciklama: '',
    engelli: false,
    engel_yuzdesi: null,
  }
}

export function normalizeHastalar(
  hastalar: unknown,
  legacy?: {
    hasta_adi?: string | null
    saglik_aciklama?: string | null
    engel_yuzdesi?: number | null
  },
): HastaKaydi[] {
  if (Array.isArray(hastalar) && hastalar.length > 0) {
    return hastalar.map((item) => {
      const row = (item ?? {}) as Partial<HastaKaydi>
      return {
        adi: String(row.adi ?? ''),
        aciklama: String(row.aciklama ?? ''),
        engelli: Boolean(row.engelli),
        engel_yuzdesi:
          row.engel_yuzdesi == null || row.engel_yuzdesi === ('' as unknown)
            ? null
            : Number(row.engel_yuzdesi),
      }
    })
  }

  const adi = legacy?.hasta_adi?.trim() ?? ''
  const aciklama = legacy?.saglik_aciklama?.trim() ?? ''
  const engel = legacy?.engel_yuzdesi
  if (!adi && !aciklama && engel == null) return []

  return [
    {
      adi,
      aciklama,
      engelli: engel != null,
      engel_yuzdesi: engel ?? null,
    },
  ]
}

export function emptyTespitForm(): TespitFormuInsert {
  return {
    kayit_no: null,
    tc_kimlik: '',
    adi_soyadi: '',
    mahalle: '',
    gorusulen_kisi: '',
    gorusulen_yakinlik: '',
    telefon: '',
    adres_durumu: 'Doğru',
    magduriyet: [],
    magduriyet_diger: '',
    acil_ihtiyac: [],
    acil_ihtiyac_diger: [],
    yardim_kurumlari: [],
    yardim_stk_adi: '',
    yardim_kurumlari_diger: [],
    yardim_turleri: [],
    yardim_turleri_diger: [],
    mal_varligi: [],
    mal_varligi_diger: [],
    ev_esyalari: [],
    ev_esyalari_diger: [],
    ev_mulkiyet: null,
    ev_mulkiyet_diger: '',
    kira_tutari: null,
    ev_durum: [],
    ev_durum_diger: '',
    ev_tipi: null,
    ev_tipi_diger: '',
    ev_ozellik: [],
    ev_ozellik_diger: [],
    oda_sayisi: '',
    gelir: emptyGelir(),
    gider: emptyGider(),
    saglik_durumlari: [],
    saglik_diger: [],
    hastalar: [],
    devamli_hasta_sayisi: null,
    hasta_adi: '',
    saglik_aciklama: '',
    tibbi_cihaz_gerekli: false,
    tibbi_mudahale_gerekli: false,
    engel_yuzdesi: null,
    kronik_hasta_sayisi: null,
    dusunceler: '',
    aciliyet: 0,
    vakif_gorevlisi: '',
    tespit_tarihi: new Date().toISOString().slice(0, 10),
    created_by: null,
  }
}

/*
 * وَأَحْسِنُوا ۛ إِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ
 * "İyilik edin. Şüphesiz Allah iyilik edenleri sever." (Bakara 2/195)
 */
