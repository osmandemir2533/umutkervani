import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--uk-muted)]">404</p>
      <h1 className="font-brand mt-2 text-3xl font-bold text-[var(--uk-ink)]">Sayfa bulunamadı</h1>
      <p className="mt-3 text-sm text-[var(--uk-muted)]">
        Girdiğiniz adres geçersiz veya kaldırılmış olabilir.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl border border-[var(--uk-input-border)] bg-[var(--uk-surface)] px-4 py-2.5 text-sm font-semibold text-[var(--uk-ink)]"
        >
          ← Geri
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="uk-btn-primary"
        >
          Ana sayfa
        </button>
      </div>
    </div>
  )
}

/*
 * وَقُل رَّبِّ زِدْنِي عِلْمًا
 * "Rabbim, ilmimi artır." (Tâhâ 20/114)
 */
