import './styles/App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Board from './pages/admin/Board'
import PrivateRoute from './components/PrivateRoute'
import InquiryForm from './pages/public/InquiryForm'
import StaffManagement from './pages/admin/StaffManagement'
import InquiryDetail from './pages/admin/InquiryDetail'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/board" element={<Board />} />
            <Route path="/admin/staff" element={<StaffManagement />} />
            <Route path="/admin/inquiries/:id" element={<InquiryDetail />} />
          </Route>

          <Route path="/inquiry" element={<InquiryForm />} />

          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
