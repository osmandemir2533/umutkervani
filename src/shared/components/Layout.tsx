import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { emailToUsername } from '../../features/auth/username'
import { useTheme } from '../theme/ThemeContext'
import LiveClock from './LiveClock'

function ListIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

function ExitIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4M12 8a4 4 0 100 8 4 4 0 000-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 14.5A8.5 8.5 0 1111.5 3 7 7 0 0021 14.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Layout() {
  const { signOut, user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const hideDesktopFab = pathname === '/kayit/yeni' || pathname.endsWith('/duzenle')
  const displayName = emailToUsername(user?.email)

  function focusSearch() {
    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('uk:focus-search'))
      return
    }
    navigate('/', { state: { focusSearch: true } })
  }

  return (
    <div className="min-h-screen pb-[calc(5.25rem+var(--safe-bottom))] sm:pb-8">
      <header
        className="sticky top-0 z-20 overflow-hidden text-white shadow-lg"
        style={{ boxShadow: `0 10px 30px -12px var(--uk-header-shadow)` }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(120deg, #0a2f24 0%, #0f4a38 55%, #1a6b52 100%)',
          }}
        />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5">
          <Link to="/" className="min-w-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white/40">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#e8d5a3]">
              Balıkesir · Umut Kervanı
            </p>
            <h1 className="font-brand truncate text-xl font-bold leading-tight text-white sm:text-2xl">
              Panel
            </h1>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LiveClock />
            <button
              type="button"
              onClick={toggleTheme}
              className="uk-press inline-flex size-10 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/25"
              title={theme === 'dark' ? 'Açık mod' : 'Koyu mod'}
              aria-label="Tema değiştir"
            >
              <ThemeIcon dark={theme === 'dark'} />
            </button>
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={() => void signOut()}
                className="uk-press inline-flex items-center gap-1.5 rounded-xl bg-[#c45c4a] px-3.5 py-2.5 text-sm font-bold text-white shadow-md shadow-black/20 ring-1 ring-white/10 hover:bg-[#b04e3d]"
              >
                <ExitIcon />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
              {displayName && (
                <p className="max-w-[9rem] truncate px-0.5 text-[10px] font-semibold tracking-wide text-[#e8d5a3] sm:max-w-[12rem] sm:text-[11px]">
                  {displayName}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="relative uk-ornament opacity-70" />
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:py-7">
        <Outlet />
      </main>

      <nav className="uk-mobile-dock" aria-label="Mobil menü">
        <div className="uk-mobile-dock__pill">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              ['uk-mobile-dock__btn', isActive ? 'is-active' : ''].join(' ')
            }
          >
            <ListIcon />
            Liste
          </NavLink>

          <button type="button" onClick={focusSearch} className="uk-mobile-dock__btn" aria-label="Ara">
            <SearchIcon />
            Ara
          </button>

          <NavLink to="/kayit/yeni" className="uk-mobile-dock__add" aria-label="Yeni kayıt">
            <PlusIcon size={22} />
          </NavLink>
        </div>
      </nav>

      {!hideDesktopFab && (
        <div className="fixed bottom-6 right-6 z-20 hidden sm:block">
          <NavLink to="/kayit/yeni" className="uk-btn-primary shadow-xl">
            <PlusIcon />
            Yeni Kayıt
          </NavLink>
        </div>
      )}
    </div>
  )
}

/*
 * وَالَّذِينَ آمَنُوا وَهَاجَرُوا وَجَاهَدُوا فِي سَبِيلِ اللَّهِ
 * "İman edip hicret edenler ve Allah yolunda cihad edenler…" (Enfâl 8/74)
 */
