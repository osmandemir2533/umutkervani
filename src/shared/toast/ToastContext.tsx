import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type ToastKind = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

interface ToastContextValue {
  notify: (message: string, kind?: ToastKind) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

let toastId = 0
/** StrictMode / hızlı çift çağrı için kısa süreli dedupe */
let lastNotifyKey = ''
let lastNotifyAt = 0

const KIND_META: Record<
  ToastKind,
  { title: string; icon: string; bar: string; panel: string; text: string }
> = {
  success: {
    title: 'Başarılı',
    icon: '✓',
    bar: 'bg-[var(--uk-green)]',
    panel:
      'border-[color-mix(in_srgb,var(--uk-green)_40%,transparent)] bg-[color-mix(in_srgb,var(--uk-green)_12%,var(--uk-surface))]',
    text: 'text-[var(--uk-green)]',
  },
  error: {
    title: 'Hata',
    icon: '!',
    bar: 'bg-[var(--uk-danger)]',
    panel:
      'border-[color-mix(in_srgb,var(--uk-danger)_45%,transparent)] bg-[color-mix(in_srgb,var(--uk-danger)_12%,var(--uk-surface))]',
    text: 'text-[var(--uk-danger)]',
  },
  info: {
    title: 'Bilgi',
    icon: 'i',
    bar: 'bg-[var(--uk-gold-text)]',
    panel:
      'border-[color-mix(in_srgb,var(--uk-gold)_55%,transparent)] bg-[color-mix(in_srgb,var(--uk-gold)_14%,var(--uk-surface))]',
    text: 'text-[var(--uk-gold-text)]',
  },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((message: string, kind: ToastKind = 'success') => {
    const trimmed = message.trim()
    if (!trimmed) return

    const key = `${kind}:${trimmed}`
    const now = Date.now()
    if (key === lastNotifyKey && now - lastNotifyAt < 900) return
    lastNotifyKey = key
    lastNotifyAt = now

    const id = ++toastId
    setItems((prev) => {
      if (prev.some((t) => t.message === trimmed && t.kind === kind)) return prev
      return [...prev, { id, message: trimmed, kind }]
    })
    window.setTimeout(() => dismiss(id), kind === 'error' ? 5200 : 4200)
  }, [dismiss])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed right-3 top-[4.75rem] z-[80] flex w-[min(24rem,calc(100vw-1.5rem))] flex-col items-stretch gap-2.5 sm:right-5 sm:top-[5.25rem]"
        aria-live="polite"
      >
        {items.map((t) => {
          const meta = KIND_META[t.kind]
          return (
            <div
              key={t.id}
              role="status"
              className={[
                'pointer-events-auto uk-fade-up overflow-hidden rounded-2xl border shadow-[0_12px_32px_-12px_rgba(0,0,0,0.35)] backdrop-blur-sm',
                meta.panel,
              ].join(' ')}
            >
              <div className="flex">
                <div className={`w-1.5 shrink-0 self-stretch ${meta.bar}`} aria-hidden />
                <div className="flex min-w-0 flex-1 items-start gap-3 px-3.5 py-3">
                  <span
                    className={[
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black text-white shadow-sm',
                      meta.bar,
                    ].join(' ')}
                    aria-hidden
                  >
                    {meta.icon}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={`text-xs font-bold uppercase tracking-wide ${meta.text}`}>
                      {meta.title}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold leading-snug text-[var(--uk-ink)]">
                      {t.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    className="shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-[var(--uk-muted)] transition hover:bg-[color-mix(in_srgb,var(--uk-ink)_8%,transparent)] hover:text-[var(--uk-ink)]"
                    aria-label="Bildirimi kapat"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast yalnızca ToastProvider içinde')
  return ctx
}

/*
 * فَبَشِّرْ عِبَادِ
 * "Kullarıma müjde ver." (Zümer 39/17)
 */
