import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlitchBackground from '../components/not-found/GlitchBackground';
import PanicMessage from '../components/server-error/PanicMessage';

export default function ServerError() {
    const navigate = useNavigate();

    return (
        <div className="h-screen w-full bg-[#161b33] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            {/* Background elements - Reuse GlitchBackground with a reddish tint if possible, 
                or just keep it as is since it provides the texture and blobs */}
            <GlitchBackground code="500" />
            
            {/* Additional red glows for the server error theme */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px]"></div>
            </div>

            <PanicMessage onBack={() => navigate('/dashboard')} />

            {/* Global animations used across the app */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
