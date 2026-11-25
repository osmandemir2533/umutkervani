import { useEffect, useState } from 'react'

function formatNow(date: Date) {
  const gunKisa = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)
  const gun = new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
  const saat = new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
  return { gun, gunKisa, saat }
}

export default function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { gun, gunKisa, saat } = formatNow(now)

  return (
    <div className="text-right leading-tight">
      <p className="text-[9px] font-medium capitalize text-[#e8d5a3] sm:hidden">{gunKisa}</p>
      <p className="hidden text-[10px] font-medium capitalize text-[#e8d5a3] sm:block">{gun}</p>
      <p className="font-mono text-xs font-bold tabular-nums text-white sm:text-sm">{saat}</p>
    </div>
  )
}

/*
 * وَهُوَ الَّذِي جَعَلَ اللَّيْلَ وَالنَّهَارَ خِلْفَةً
 * "O, geceyi ve gündüzü birbiri ardınca getirendir." (Furkân 25/62)
 */
