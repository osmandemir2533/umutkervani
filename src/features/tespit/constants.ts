/** Form seçenekleri — tek yerden yönetilir */

export const MAGDURIYET_OPTIONS = [
  'Dul',
  'Engelli',
  'Tutuklu ailesi',
  'Terk edilen',
  'Yetim',
  'Öğrenci',
  'Afetzede',
  'Sığınmacı',
  'Muhtaç',
  'Gelir yetmezliği',
  'Diğer',
] as const

export const ACIL_IHTIYAC_OPTIONS = [
  'Nakit',
  'Gıda',
  'Giyim',
  'Eğitim',
  'Hukuk',
  'Ev eşyası',
  'Sıcak yemek',
  'Sağlık',
  'Barınma',
  'Yakacak',
  'Diğer',
] as const

export const YARDIM_KURUM_OPTIONS = [
  'Akraba',
  'Belediye',
  'Komşu',
  'Kaymakamlık',
  'Hayırseverler',
  'STK / Dernek',
  'Diğer',
  'Yok',
] as const

export const STK_OPTION = 'STK / Dernek'

export const YARDIM_TURU_OPTIONS = [
  'Nakit',
  'Gıda',
  'Giyim',
  'Ev eşyası',
  'Yakacak',
  'Yakıt',
  'Sıcak yemek',
  'Diğer',
  'Yok',
] as const

export const MAL_VARLIGI_OPTIONS = [
  'Daire',
  'Yazlık',
  'Arsa',
  'Araba',
  'Tarla',
  'Diğer',
  'Yok',
] as const

export const EV_ESYALARI_OPTIONS = [
  'Buzdolabı',
  'Fırın / Ocak',
  'Çamaşır makinesi',
  'Bulaşık makinesi',
  'Televizyon',
  'Bilgisayar',
  'Elektrikli süpürge',
  'Klima',
  'Koltuk takımı',
  'Çekyat',
  'Yatak',
  'Dolap',
  'Ütü',
  'Şofben',
  'Halı',
  'Diğer',
] as const

export const EV_MULKIYET_OPTIONS = [
  'Kendisinin',
  'Kira',
  'Lojman',
  'Sığınma',
  'Tahsis edilmiş',
  'Diğer',
] as const

export const EV_DURUM_OPTIONS = [
  'Geçici',
  'Hasarlı',
  'Orta hasarlı',
  'Normal',
  'Diğer',
] as const

export const EV_TIP_OPTIONS = [
  'Apartman',
  'Müstakil',
  'Baraka',
  'Dükkan',
  'Bina',
  'Harabe',
  'Gecekondu',
  'Diğer',
] as const

export const EV_OZELLIK_OPTIONS = [
  'Eski yapı',
  'Yeni yapı',
  'Nemli',
  'Rutubetli',
  'Kaloriferli',
  'Doğalgazlı',
  'Sobalı',
  'Mutfaksız',
  'Bakımsız',
  'Diğer',
] as const

export const ADRES_DURUM_OPTIONS = [
  'Doğru',
  'Yanlış',
  'Taşınmış',
  'Evde yok',
] as const

export const YAKINLIK_OPTIONS = [
  'Kendisi',
  'Annesi',
  'Babası',
  'Eşi',
  'Kardeşi',
  'Çocuğu',
  'Amcası',
  'Dayısı',
  'Halası',
  'Teyzesi',
  'Komşusu',
  'Diğer',
] as const

export const SAGLIK_DURUM_OPTIONS = [
  'Engelli',
  'Yatalak',
  'Astım',
  'Bel fıtığı',
  'Boyun fıtığı',
  'Böbrek yetmezliği',
  'Kan hastalığı',
  'Tüberküloz',
  'Hepatit B',
  'Hepatit C',
  'Hepatit D',
  'Ortopedik',
  'Tansiyon',
  'Solunum',
  'Sindirim',
  'Diyaliz',
  'Kanser',
  'Damar',
  'Şeker',
  'Kalp',
  'Göz',
  'Sinir',
  'KBB',
  'Diğer',
] as const

export const GELIR_ALANLARI = [
  { key: 'dul_maasi', label: 'Dul maaşı' },
  { key: 'yasli_maasi', label: 'İhtiyarlık maaşı' },
  { key: 'engelli_maasi', label: 'Engelli maaşı' },
  { key: 'ozurlu_maasi', label: 'Özürlü maaşı' },
  { key: 'issizlik_maasi', label: 'İşsizlik maaşı' },
  { key: 'cocuk_yardimi', label: 'Çocuk yardımı' },
  { key: 'bakici_ucreti', label: 'Bakıcı ücreti' },
  { key: 'emekli_maasi', label: 'Emekli maaşı' },
  { key: 'nafaka', label: 'Nafaka' },
  { key: 'kira_geliri', label: 'Kira geliri' },
  { key: 'maas_ucret', label: 'Aylık Maaş / ücret' },
  { key: 'diger_gelir', label: 'Diğer gelir' },
] as const

export const GIDER_ALANLARI = [
  { key: 'kira', label: 'Kira' },
  { key: 'faturalar', label: 'Faturalar' },
  { key: 'okul_gideri', label: 'Okul gideri' },
  { key: 'gida', label: 'Gıda' },
  { key: 'giyim', label: 'Giyim' },
  { key: 'saglik_gideri', label: 'Sağlık' },
  { key: 'diger_gider', label: 'Diğer gider' },
] as const

export const ACILIYET_OPTIONS = [
  {
    value: 0,
    title: 'Belirlenecek',
    period: 'sonradan',
    label: 'Belirlenecek — şuan derecesi belli değil',
  },
  { value: 1, title: 'Birinci derece', period: 'her ay', label: 'Birinci derece — Her ay' },
  { value: 2, title: 'İkinci derece', period: '2 ayda bir', label: 'İkinci derece — 2 ayda bir' },
  { value: 3, title: 'Üçüncü derece', period: '3 ayda bir', label: 'Üçüncü derece — 3 ayda bir' },
  { value: 4, title: 'Dördüncü derece', period: '6 ayda bir', label: 'Dördüncü derece — 6 ayda bir' },
  { value: 5, title: 'Beşinci derece', period: 'yılda bir', label: 'Beşinci derece — Yılda bir' },
  { value: 6, title: 'Altıncı derece', period: 'red', label: 'Altıncı derece — Red' },
  {
    value: 7,
    title: 'Yedinci derece',
    period: 'tek seferlik',
    label: 'Yedinci derece — Tek seferlik',
  },
] as const

export type AciliyetDerece = (typeof ACILIYET_OPTIONS)[number]['value']

/*
 * مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ
 * "Mallarını Allah yolunda harcayanların durumu, yedi başak bitiren bir dane gibidir." (Bakara 2/261)
 */
