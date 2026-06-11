/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Printer } from 'lucide-react';
import { CertificateSkeleton } from '../components/skeletons/CertificateSkeleton';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import CertificateCard from '../components/certificates/CertificateCard.jsx';

export default function CertificateView() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuthStore();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/certificates/${moduleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setCertificate(response.data.certificate);

                    // Launch celebratory confetti
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.6 },
                        colors: ['#384A99', '#E57B3C', '#ffffff', '#22c55e'],
                        zIndex: 9999
                    });
                }
            } catch (error) {
                console.error('Error fetching certificate:', error);
                toast.error('No se pudo cargar el certificado. Asegúrate de haber completado el módulo.');
                navigate('/profile');
            } finally {
                setLoading(false);
            }
        };

        if (moduleId) {
            fetchCertificate();
        }
    }, [moduleId, token, navigate]);

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Certificado_${certificate?.certificate_code || 'CGR'}`;

        // Wait for title update then trigger print
        setTimeout(() => {
            window.print();
            document.title = originalTitle;
        }, 150);
    };

    if (loading) return <CertificateSkeleton />;
    if (!certificate) return null;

    return (
        <div className="min-h-screen bg-[#0d1127] p-4 md:p-12 flex flex-col items-center overflow-auto animate-fade-in relative">
            {/* Action Bar - Pure UI Layer */}
            <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-12 print:hidden gap-6 bg-slate-900/40 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-2xl">
                <button
                    onClick={() => navigate(location.state?.from || '/dashboard', { state: { openCertificates: location.state?.openCertificates } })}
                    className="flex items-center gap-3 text-gray-500 hover:text-white transition-all group px-4 py-2 hover:bg-white/5 rounded-2xl border border-transparent hover:border-white/5"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] leading-none">Cerrar</span>
                </button>

                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex flex-col items-center md:items-end text-center md:text-right">
                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-1 italic opacity-80 leading-none">Documento Validado</p>
                        <p className="text-white font-black text-xs tracking-widest uppercase truncate max-w-[200px]">{certificate.certificate_code}</p>
                    </div>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-3 px-8 py-4 bg-secondary-600 hover:bg-secondary-500 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-[0_0_30px_rgba(229,123,60,0.3)] hover:shadow-secondary-500/50 active:scale-95 group border border-secondary-500/20"
                    >
                        <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Exportar Certificado
                    </button>
                </div>
            </div>

            {/* The Actual Document Layer */}
            <div className="w-full flex justify-center pb-20">
                <CertificateCard certificate={certificate} user={user} />
            </div>

            {/* Print & Typography Injection */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap');
                    
                    @page {
                        size: landscape;
                        margin: 0;
                    }

                    @media print {
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            background: white !important;
                        }
                        body * {
                            visibility: hidden !important;
                        }
                        #certificate-print, 
                        #certificate-print * {
                            visibility: visible !important;
                        }
                        #certificate-print {
                            position: fixed !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100vw !important;
                            height: 100vh !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            border: none !important;
                            box-shadow: none !important;
                            display: flex !important;
                            z-index: 9999999 !important;
                            border-radius: 0 !important;
                        }
                    }

                    .font-serif {
                        font-family: 'Playfair Display', serif;
                    }
                    .font-signature {
                        font-family: 'Great Vibes', cursive;
                    }
                `}
            </style>
        </div>
    );
}
