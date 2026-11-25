import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ThemeProvider } from './shared/theme/ThemeContext'
import { ToastProvider } from './shared/toast/ToastContext'
import App from './app/App'
import './index.css'

/** HashRouter: GitHub Pages’te /#/giris gibi yollar 404 vermez */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </HashRouter>
  </StrictMode>,
)

/*
 * إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ
 * "Müminler ancak kardeştirler." (Hucurât 49/10)
 */
