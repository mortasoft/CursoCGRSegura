/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { ArrowLeft, Printer, Award, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export default function CertificateView() {
    const { moduleId } = useParams();
    const navigate = useNavigate();
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
                    // Launch confetti on load!
                    confetti({
                        particleCount: 150,
                        spread: 100,
                        origin: { y: 0.6 },
                        colors: ['#384A99', '#E57B3C', '#ffffff'],
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
        document.title = 'certificado';

        // Pequena espera para que el titulo se actualice en el sistema de impresion
        setTimeout(() => {
            window.print();
            document.title = originalTitle;
        }, 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0d1127]">
                <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!certificate) return null;

    return (
        <div className="min-h-screen bg-[#0d1127] p-8 flex flex-col items-center overflow-auto">
            {/* Header Actions - Hide on Print */}
            <div className="w-full max-w-5xl flex justify-between items-center mb-8 print:hidden animate-fade-in-down">
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-widest">Volver al Perfil</span>
                </button>

                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-6 py-3 bg-secondary-600 hover:bg-secondary-500 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-secondary-500/20 active:scale-95"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </div>

            {/* Certificate Container */}
            <div id="certificate-print" className="relative w-full max-w-[1100px] aspect-[1.414/1] bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full print:h-full print:absolute print:top-0 print:left-0 print:m-0 animate-scale-in rounded-sm">

                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #000 1px, transparent 0)', backgroundSize: '40px 40px' }}>
                </div>

                {/* Border Frame */}
                <div className="absolute inset-8 border-[12px] border-double border-primary-900/10 pointer-events-none"></div>
                <div className="absolute inset-6 border border-primary-900/20 pointer-events-none"></div>

                {/* Corner Ornaments */}
                <div className="absolute top-8 left-8 w-32 h-32 border-t-[3px] border-l-[3px] border-secondary-500/40"></div>
                <div className="absolute top-8 right-8 w-32 h-32 border-t-[3px] border-r-[3px] border-secondary-500/40"></div>
                <div className="absolute bottom-8 left-8 w-32 h-32 border-b-[3px] border-l-[3px] border-secondary-500/40"></div>
                <div className="absolute bottom-8 right-8 w-32 h-32 border-b-[3px] border-r-[3px] border-secondary-500/40"></div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 px-16 text-center">

                    {/* Header */}
                    <div className="space-y-2">
                        <div className="w-32 h-32 mx-auto mb-2">
                            <img src="/images/Logotipo-CGR.jpg" alt="Logo CGR" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-5xl font-serif text-primary-900 tracking-wider font-bold">CERTIFICADO</h1>
                        <p className="text-xl font-medium text-secondary-600 uppercase tracking-[0.3em]">DE FINALIZACIÓN</p>
                    </div>

                    {/* Main Text */}
                    <div className="space-y-4 max-w-4xl w-full">
                        <p className="text-gray-500 font-serif italic text-xl">Se otorga el presente reconocimiento a:</p>

                        <div className="relative inline-block w-full max-w-2xl mx-auto">
                            <h2 className="text-4xl font-bold text-slate-900 font-serif border-b-2 border-slate-200 pb-4 px-12 block w-full uppercase tracking-tight">
                                {certificate.first_name || user.first_name} {certificate.last_name || user.last_name}
                            </h2>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white px-3">
                                <Award className="w-8 h-8 text-secondary-500 fill-secondary-100" />
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <p className="text-gray-600 font-serif text-lg leading-relaxed">
                                Por haber completado satisfactoriamente el módulo de capacitación en seguridad de la información del curso "CGR Segura":
                            </p>

                            <h3 className="text-4xl font-bold text-primary-800 font-serif uppercase tracking-tight py-4 px-8 bg-slate-50 rounded-xl inline-block border border-slate-100 shadow-sm">
                                "{certificate.module_title}"
                            </h3>
                        </div>

                        <div className="flex justify-between items-center max-w-4xl mx-auto pt-4 border-t border-slate-100 mt-8">
                            <div className="text-left flex gap-8">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">FECHA DE EMISIÓN</p>
                                    <p className="text-sm font-bold text-slate-800 uppercase">
                                        {new Date(certificate.issued_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">CÓDIGO OFICIAL</p>
                                    <p className="text-sm font-mono font-bold text-slate-800 uppercase tracking-tighter">
                                        {certificate.certificate_code}
                                    </p>
                                </div>
                            </div>

                            {/* Signature Area Only */}
                            <div className="text-right space-y-1 min-w-[220px] flex flex-col items-end">
                                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Emitido por</p>
                                <p className="text-xs font-bold text-slate-900 uppercase">Contraloría General de la República</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
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
                        /* Hide everything */
                        body * {
                            visibility: hidden !important;
                        }
                        /* Show only the certificate and its specific children */
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
                        }
                    }
                    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Great+Vibes&display=swap');
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
