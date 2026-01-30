import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute() {
    const { isAuthenticated, verifyToken } = useAuthStore();
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
