import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function LoginPage() {
  const { user, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const result = await signIn(username.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setError('Giriş başarısız. Kullanıcı adı veya şifreyi kontrol edin.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="relative flex flex-1 flex-col justify-end px-5 pb-8 pt-14 text-white sm:justify-center sm:pb-12">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(165deg, #0a2f24 0%, #0f4a38 42%, #1a6b52 78%, #246b4a 100%)',
          }}
        />
        <div className="pointer-events-none absolute -right-16 top-10 size-56 rounded-full bg-[radial-gradient(circle,#e8d5a3_0%,transparent_70%)] opacity-20 blur-2xl" />

        <div className="uk-fade-up mx-auto w-full max-w-md text-center">
          <p
            className="font-arabic text-[1.65rem] leading-relaxed text-[var(--uk-gold-soft)] sm:text-3xl"
            dir="rtl"
            lang="ar"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <div className="uk-ornament mx-auto my-5 w-40" />
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">Balıkesir</p>
          <h1 className="mt-2 font-brand text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Umut Kervanı
          </h1>
          <p className="mt-3 text-sm text-white/80 sm:text-base">
            Panel · Peygamber Gönülleri
          </p>
        </div>
      </div>

      <div className="uk-fade-up-delay relative rounded-t-[2rem] bg-[var(--uk-sand)] px-5 pb-[max(1.5rem,var(--safe-bottom))] pt-7 shadow-[0_-12px_40px_rgba(10,47,36,0.18)] sm:mx-auto sm:mb-10 sm:w-full sm:max-w-md sm:rounded-[1.75rem] sm:border sm:border-[color-mix(in_srgb,var(--uk-green)_12%,transparent)] sm:shadow-xl">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-[var(--uk-ink)]">
              Kullanıcı adı
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="uk-input text-base"
              placeholder="örn. ahmet"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[var(--uk-ink)]">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="uk-input text-base"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-[var(--uk-danger)] ring-1 ring-red-100">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="uk-btn-primary mt-1 w-full text-base">
            {submitting ? 'Giriş yapılıyor…' : 'Giriş Yap'}
          </button>

          <p className="pt-2 text-center font-arabic text-sm text-[var(--uk-muted)]" dir="rtl" lang="ar">
            وَتَعَاوَنُوا عَلَى ٱلْبِرِّ وَٱلتَّقْوَىٰ
          </p>
        </form>
      </div>
    </div>
  )
}

/*
 * وَقُل رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ
 * "Rabbim! Beni doğrulukla girdir ve doğrulukla çıkar." (İsrâ 17/80)
 */
