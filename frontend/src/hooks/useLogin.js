import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function useLogin() {
    const navigate = useNavigate();
    const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();

    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error, clearError]);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            const result = await loginWithGoogle(tokenResponse.access_token);
            if (result.success) {
                if (result.user.is_active === false) {
                    toast.error('Tu cuenta está deshabilitada');
                    navigate('/disabled');
                } else {
                    toast.success(`¡Hola! ${result.user.firstName}`);
                    navigate('/dashboard');
                }
            }
        },
        onError: (errorResponse) => {
            console.error('Google Sign-In Error:', errorResponse);
            toast.error('No se pudo establecer conexión con Google. Verifique su cuenta.');
        },
    });

    return {
        googleLogin,
        isLoading
    };
}
