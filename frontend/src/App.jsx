import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import LessonView from './pages/LessonView';
import QuizView from './pages/QuizView';
import SurveyView from './pages/SurveyView';
import CertificateView from './pages/CertificateView';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel';
import AdminModules from './pages/AdminModules';
import Reports from './pages/Reports';
import DriveAuditReport from './pages/DriveAuditReport';
import DriveAuditHistory from './pages/DriveAuditHistory';
import AdminUsers from './pages/AdminUsers';
import AdminDirectory from './pages/AdminDirectory';
import AdminDepartments from './pages/AdminDepartments';
import AdminBadges from './pages/AdminBadges';
import AdminLessonEditor from './pages/AdminLessonEditor';
import AdminSettings from './pages/AdminSettings';
import AdminAssignments from './pages/AdminAssignments';
import AdminPhishing from './pages/AdminPhishing';
import AdminInteractions from './pages/AdminInteractions';
import AdminSurveys from './pages/AdminSurveys';
import AdminSurveyDetail from './pages/AdminSurveyDetail';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminNotifications from './pages/AdminNotifications';
import AdminDriveAuditor from './pages/AdminDriveAuditor';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Maintenance from './pages/Maintenance';
import DisabledAccount from './pages/DisabledAccount';

import DriveAuditorStandalone from './pages/DriveAuditorStandalone';
import MajesticEvidence from './pages/MajesticEvidence';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import ToastSoundEffect from './components/ToastSoundEffect';
import AppToaster from './components/AppToaster';
import { useThemeStore } from './store/themeStore';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com';

function App() {
  const { isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  // Aplicar tema globalmente
  React.useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ToastSoundEffect />
        <AppToaster />

        <Routes>
          {/* Ruta pública de login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
          />

          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            
            {/* Standalone pages without layout */}
            <Route path="/drive-auditor" element={<DriveAuditorStandalone />} />

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/modules/:id" element={<ModuleDetail />} />
              <Route path="/lessons/:id" element={<LessonView />} />
              <Route path="/quizzes/:id" element={<QuizView />} />
              <Route path="/surveys/:id" element={<SurveyView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/dashboard/drive-auditor/report/:reportId" element={<DriveAuditReport />} />
              <Route path="/dashboard/drive-auditor/history" element={<DriveAuditHistory />} />
              <Route path="/dashboard/confidential-files" element={<MajesticEvidence />} />

              {/* Rutas de administrador compartidas con Analista */}
              <Route element={<AdminRoute roles={['admin', 'analyst']} />}>
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/admin/reports" element={<Reports />} />
                <Route path="/admin/surveys" element={<AdminSurveys />} />
                <Route path="/admin/surveys/:id" element={<AdminSurveyDetail />} />
                <Route path="/admin/interactions" element={<AdminInteractions />} />
              </Route>


              {/* Rutas exclusivas de administrador */}
              <Route element={<AdminRoute roles={['admin']} />}>
                <Route path="/admin/modules" element={<AdminModules />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/users/:userId/profile" element={<Profile />} />
                <Route path="/admin/directory" element={<AdminDirectory />} />
                <Route path="/admin/areas" element={<AdminDepartments />} />
                <Route path="/admin/badges" element={<AdminBadges />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/assignments" element={<AdminAssignments />} />
                <Route path="/admin/phishing" element={<AdminPhishing />} />
                <Route path="/admin/announcements" element={<AdminAnnouncements />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/drive-auditor" element={<AdminDriveAuditor />} />
                <Route path="/admin/lessons/:id/editor" element={<AdminLessonEditor />} />
              </Route>


            </Route>

            {/* Rutas protegidas a pantalla completa (sin Layout) */}
            <Route path="/certificates/module/:moduleId" element={<CertificateView />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Página 404, 500 y Mantenimiento - Fuera del Layout para pantalla completa */}
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/disabled" element={<DisabledAccount />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
