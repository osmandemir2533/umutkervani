/** Supabase tabloları için TypeScript tipleri */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface GelirDurumu {
  dul_maasi: number
  yasli_maasi: number
  engelli_maasi: number
  ozurlu_maasi: number
  issizlik_maasi: number
  cocuk_yardimi: number
  bakici_ucreti: number
  emekli_maasi: number
  nafaka: number
  kira_geliri: number
  maas_ucret: number
  diger_gelir: number
}

export interface GiderDurumu {
  kira: number
  faturalar: number
  okul_gideri: number
  gida: number
  giyim: number
  saglik_gideri: number
  diger_gider: number
}

export interface HastaKaydi {
  adi: string
  aciklama: string
  engelli: boolean
  engel_yuzdesi: number | null
}

export interface TespitFormu {
  id: string
  kayit_no: string | null
  tc_kimlik: string
  adi_soyadi: string
  mahalle: string | null
  gorusulen_kisi: string | null
  gorusulen_yakinlik: string | null
  telefon: string | null
  adres_durumu: string | null
  magduriyet: string[]
  magduriyet_diger: string | null
  acil_ihtiyac: string[]
  acil_ihtiyac_diger: string[]
  yardim_kurumlari: string[]
  yardim_stk_adi: string | null
  yardim_kurumlari_diger: string[]
  yardim_turleri: string[]
  yardim_turleri_diger: string[]
  mal_varligi: string[]
  mal_varligi_diger: string[]
  ev_esyalari: string[]
  ev_esyalari_diger: string[]
  ev_mulkiyet: string | null
  ev_mulkiyet_diger: string | null
  kira_tutari: number | null
  ev_durum: string[]
  ev_durum_diger: string | null
  ev_tipi: string | null
  ev_tipi_diger: string | null
  ev_ozellik: string[]
  ev_ozellik_diger: string[]
  oda_sayisi: string | null
  gelir: GelirDurumu
  gider: GiderDurumu
  saglik_durumlari: string[]
  saglik_diger: string[]
  hastalar: HastaKaydi[]
  devamli_hasta_sayisi: number | null
  /** Eski alanlar — yeni kayıtlarda boş bırakılır */
  hasta_adi: string | null
  saglik_aciklama: string | null
  tibbi_cihaz_gerekli: boolean
  tibbi_mudahale_gerekli: boolean
  engel_yuzdesi: number | null
  kronik_hasta_sayisi: number | null
  dusunceler: string | null
  aciliyet: number
  vakif_gorevlisi: string | null
  tespit_tarihi: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export type TespitFormuInsert = Omit<TespitFormu, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type TespitFormuUpdate = Partial<TespitFormuInsert>

export type Database = {
  public: {
    Tables: {
      tespit_formlari: {
        Row: TespitFormu
        Insert: TespitFormuInsert
        Update: TespitFormuUpdate
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

/*
 * وَفِي أَمْوَالِهِمْ حَقٌّ لِّلسَّائِلِ وَالْمَحْرُومِ
 * "Onların mallarında isteyen ve yoksul için bir hak vardır." (Zâriyât 51/19)
 */
