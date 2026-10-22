import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Explore from './pages/Explore'
import ForgotPassword from './pages/ForgotPassword'
import Guide from './pages/Guide'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PostDetail from './pages/PostDetail'
import PostEditor from './pages/PostEditor'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="post/:postId" element={<PostDetail />} />
          <Route path="guide" element={<Guide />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />

          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="write" element={<PostEditor />} />
            <Route path="edit/:postId" element={<PostEditor />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
