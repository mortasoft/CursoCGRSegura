import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import CertificateView from './pages/CertificateView';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import AdminModules from './pages/AdminModules';
import Reports from './pages/Reports';
import AdminUsers from './pages/AdminUsers';
import AdminDirectory from './pages/AdminDirectory';
import AdminDepartments from './pages/AdminDepartments';
import AdminBadges from './pages/AdminBadges';
import AdminLessonEditor from './pages/AdminLessonEditor';
import AdminSettings from './pages/AdminSettings';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Maintenance from './pages/Maintenance';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0d1127',
              color: '#fff',
              border: '1px solid rgba(56, 74, 153, 0.3)',
              borderRadius: '1.2rem',
              padding: '16px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              maxWidth: '500px',
              backdropFilter: 'blur(10px)',
            },
            success: {
              iconTheme: {
                primary: '#28a9e0',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#e57b3c',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Ruta pública de login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/modules/:id" element={<ModuleDetail />} />
              <Route path="/lessons/:id" element={<LessonView />} />
              <Route path="/quizzes/:id" element={<QuizView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />

              {/* Ruta de administrador */}
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/modules" element={<AdminModules />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/users/:userId/profile" element={<Profile />} />
              <Route path="/admin/directory" element={<AdminDirectory />} />
              <Route path="/admin/areas" element={<AdminDepartments />} />
              <Route path="/admin/badges" element={<AdminBadges />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/lessons/:id/editor" element={<AdminLessonEditor />} />
            </Route>

            {/* Rutas protegidas a pantalla completa (sin Layout) */}
            <Route path="/certificates/module/:moduleId" element={<CertificateView />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Página 404, 500 y Mantenimiento - Fuera del Layout para pantalla completa */}
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
