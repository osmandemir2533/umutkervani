import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** GitHub Pages: https://osmandemir2533.github.io/umutkervani/ */
const PAGES_BASE = '/umutkervani/'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Lokal `npm run dev` → `/` ; production build (Pages) → `/umutkervani/`
  base: mode === 'production' ? PAGES_BASE : '/',
}))

/*
 * إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ
 * "Şüphesiz Allah adaleti ve iyiliği emreder." (Nahl 16/90)
 */
