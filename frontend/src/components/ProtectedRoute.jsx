import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
    const { isAuthenticated, verifyToken, user } = useAuthStore();
    const [isVerifying, setIsVerifying] = useState(true);

    useEffect(() => {
        const verify = async () => {
            await verifyToken();
            setIsVerifying(false);
        };
        verify();
    }, [verifyToken]);

    if (isVerifying) {
        return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 text-slate-900">
                <div className="text-center p-10 rounded-[2rem] bg-white/80 shadow-xl border border-slate-200">
                    <div className="w-16 h-16 border-4 border-slate-300 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-800 font-medium">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // Si el usuario está deshabilitado explícitamente, redirigir a la página de cuenta deshabilitada
    if (user && user.is_active === false && window.location.pathname !== '/disabled') {
        return <Navigate to="/disabled" replace />;
    }

    return <Outlet />;
}
