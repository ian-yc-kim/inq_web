import './styles/App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/Login'
import Board from './pages/admin/Board'
import PrivateRoute from './components/PrivateRoute'
import InquiryForm from './pages/public/InquiryForm'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route path="/board" element={<Board />} />
          </Route>

          <Route path="/inquiry" element={<InquiryForm />} />

          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
