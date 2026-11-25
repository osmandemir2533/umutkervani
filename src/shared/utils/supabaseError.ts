/** Supabase / ağ hatalarını kullanıcıya Türkçe ve anlaşılır çevirir */

export function explainSupabaseError(message: string | null | undefined): {
  title: string
  detail: string
  setupHint: boolean
} {
  const raw = (message ?? '').trim()
  const lower = raw.toLowerCase()

  if (!raw) {
    return {
      title: 'Beklenmeyen hata',
      detail: 'İşlem tamamlanamadı. Bir süre sonra tekrar deneyin.',
      setupHint: false,
    }
  }

  if (
    lower.includes('schema cache') ||
    lower.includes('could not find the table') ||
    (lower.includes('relation') && lower.includes('does not exist'))
  ) {
    return {
      title: 'Veritabanı henüz kurulmamış',
      detail:
        'Supabase’te tespit_formlari tablosu bulunamadı. SQL Editor’de supabase/SETUP.sql dosyasını çalıştırın, sonra sayfayı yenileyin.',
      setupHint: true,
    }
  }

  if (lower.includes('invalid api key') || lower.includes('jwt')) {
    return {
      title: 'API anahtarı hatalı',
      detail: '.env içindeki VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini kontrol edin.',
      setupHint: true,
    }
  }

  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return {
      title: 'Bağlantı sorunu',
      detail: 'İnternet veya Supabase bağlantısı kesilmiş olabilir. Yenileyip tekrar deneyin.',
      setupHint: false,
    }
  }

  if (lower.includes('row-level security') || lower.includes('permission denied') || lower.includes('rls')) {
    return {
      title: 'Yetki hatası',
      detail: 'Bu işlem için giriş gerekli veya RLS politikaları eksik. SETUP.sql’i yeniden çalıştırın.',
      setupHint: true,
    }
  }

  if (lower.includes('duplicate') || lower.includes('unique')) {
    return {
      title: 'Kayıt çakışması',
      detail: 'Bu kayıt no zaten kullanılıyor. Farklı bir kayıt no deneyin.',
      setupHint: false,
    }
  }

  return {
    title: 'İşlem başarısız',
    detail: raw,
    setupHint: false,
  }
}

/*
 * وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ
 * "Olur ki hoşunuza gitmeyen bir şey, sizin için hayırlıdır." (Bakara 2/216)
 */
