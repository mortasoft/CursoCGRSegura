import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLogin } from '../hooks/useLogin';
import LoginBackground from '../components/login/LoginBackground';
import LoginHeader from '../components/login/LoginHeader';
import LoginCard from '../components/login/LoginCard';
import LoginFooter from '../components/login/LoginFooter';

export default function Login() {
    const { googleLogin, isLoading } = useLogin();
    // CAMBIAR SONIDO MIA AQUI
    // const audioRef = useRef(new Audio('/sounds/login.mp3'));

    /*
    useEffect(() => {
        const audio = audioRef.current;
        audio.loop = true;
        audio.volume = 0.4;
        
        // Attempt to play
        const playAudio = () => {
            audio.play().catch(e => {
                // If blocked, we wait for the first user interaction
                console.log('Autoplay blocked, waiting for interaction...');
            });
        };

        //playAudio();

        // Also try to play on any click if it was blocked
        window.addEventListener('click', playAudio, { once: true });

        return () => {
            window.removeEventListener('click', playAudio);
            audio.pause();
            audio.currentTime = 0;
        };
    }, []);
    */

    return (
        <div className="min-h-screen flex flex-col bg-[#f5ede4] relative overflow-hidden">
            <LoginBackground />

            <div className="flex-1 flex flex-col items-center justify-center p-4 relative z-10 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="w-full max-w-xl flex flex-col items-center gap-10"
                >
                    <LoginHeader />
                    <LoginCard onLogin={() => googleLogin()} isLoading={isLoading} />
                </motion.div>
            </div>

            <LoginFooter />
        </div>
    );
}
