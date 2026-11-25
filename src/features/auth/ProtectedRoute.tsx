import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

/** Giriş yapmamış kullanıcıyı login sayfasına yönlendirir */
export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-[var(--uk-muted)]">
        <p className="font-brand text-xl text-[var(--uk-green)]">Umut Kervanı</p>
        <p className="text-sm">Yükleniyor…</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/giris" replace />
  }

  return <Outlet />
}

/*
 * وَلَا تَقْفُ مَا لَيْسَ لَكَ بِهِ عِلْمٌ
 * "Hakkında bilgin olmayan şeyin ardına düşme." (İsrâ 17/36)
 */
