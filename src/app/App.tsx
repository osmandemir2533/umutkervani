import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { ProtectedRoute } from '../features/auth/ProtectedRoute'
import LoginPage from '../features/auth/LoginPage'
import Layout from '../shared/components/Layout'
import NotFoundPage from '../shared/components/NotFoundPage'
import TespitListPage from '../features/tespit/TespitListPage'
import TespitFormPage from '../features/tespit/TespitFormPage'
import TespitDetailPage from '../features/tespit/TespitDetailPage'

function LegacyTespitRedirect({ edit = false }: { edit?: boolean }) {
  const { id } = useParams()
  if (!id) return <Navigate to="/" replace />
  return <Navigate to={edit ? `/kayit/${id}/duzenle` : `/kayit/${id}`} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/giris" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<TespitListPage />} />
          <Route path="kayit/yeni" element={<TespitFormPage />} />
          <Route path="kayit/:kayitNo/duzenle" element={<TespitFormPage />} />
          <Route path="kayit/:kayitNo" element={<TespitDetailPage />} />

          <Route path="tespit/yeni" element={<Navigate to="/kayit/yeni" replace />} />
          <Route path="tespit/:id" element={<LegacyTespitRedirect />} />
          <Route path="tespit/:id/duzenle" element={<LegacyTespitRedirect edit />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

/*
 * إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا
 * "Şüphesiz biz sana apaçık bir fetih verdik." (Fetih 48/1)
 */
