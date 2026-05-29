import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Terminal, Eye, Users, FileText, ArrowLeft, RefreshCw, Radio, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNotificationStore } from '../store/notificationStore';
import { useSoundStore } from '../store/soundStore';

export default function MajesticEvidence() {
    const navigate = useNavigate();
    const isMuted = useSoundStore(state => state.isMuted);
    const volume = useSoundStore(state => state.volume);
    const [audio] = useState(() => {
        const aud = new Audio('/sounds/x-files.mp3');
        aud.loop = true;
        return aud;
    });
    const [activeTab, setActiveTab] = useState('dossier');
    const [scanActive, setScanActive] = useState(false);
    const [terminalInput, setTerminalInput] = useState('');
    const [terminalLogs, setTerminalLogs] = useState([
        'APO-DOS v7.41 (c) 1989 AGENCIA DE PROTECCIÓN OCULTA',
        'SISTEMA DE MONITOREO DE UNIDADES COMPARTIDAS - CGR SEGURA',
        'ESTADO: NÚCLEO CRÍTICO 1 - ENLACE CON DRIVE AUDITOR: ONLINE',
        'Escribe "help" para ver la lista de comandos disponibles.',
        ''
    ]);
    const [ejectedSpecimen, setEjectedSpecimen] = useState(null);
    const [isEjecting, setIsEjecting] = useState(false);
    const terminalEndRef = useRef(null);

    // Specimen Directory Data
    const [specimens, setSpecimens] = useState([
        { id: 'EBNT-023', name: 'Guevara Montero Mario A.', area: 'Servicios Generales', risk: 'Crítico', behavior: 'Encontrado modificando permisos de carpetas de auditoría a modo público. Sospechoso de infiltración biológica reptiliana.', status: 'Monitoreado' },
        { id: 'EBNT-049', name: 'Sujeto A-49 (El Infiltrador de Hojas de Cálculo)', area: 'Planificación y Presupuesto', risk: 'Crítico', behavior: 'Edita fórmulas financieras a velocidad supersónica. Detectado compartiendo presupuestos confidenciales con cuentas externas no autorizadas.', status: 'Monitoreado' },
        { id: 'EBNT-012', name: 'Sujeto B-12 (El Archivador de Pasillo)', area: 'Archivo Central Secreto', risk: 'Extremo', behavior: 'Oculta expedientes de auditoría. Dice que "el sistema los borró", pero sus escamas biológicas fueron captadas en las cámaras térmicas de los servidores.', status: 'Monitoreado' },
        { id: 'EBNT-089', name: 'Sujeto C-89 (El "Creador" de Cuentas)', area: 'Soporte TI e Infraestructura', risk: 'Alto', behavior: 'Genera cuentas de prueba con correos sospechosos de dominios alienígenas. Modifica accesos en Drive Auditor sin registrar ticket.', status: 'Monitoreado' },
        { id: 'EBNT-007', name: 'Sujeto D-07 (La Secretaria del Parpadeo Horizontal)', area: 'Secretaría de Recepción C-5', risk: 'Moderado', behavior: 'Parpadea horizontalmente cuando se le pregunta sobre la Ley Nº 8968. Almacena documentos de viaje espacial en carpetas compartidas públicas.', status: 'Monitoreado' }
    ]);    useEffect(() => {
        audio.volume = isMuted ? 0 : volume * 0.8;
        audio.muted = isMuted;
    }, [isMuted, volume, audio]);

    useEffect(() => {
        const playAudio = () => {
            audio.play().catch(err => {
                console.log('Playback prevented, retrying on first user click:', err);
                const retryPlay = () => {
                    audio.play().catch(e => console.log('Retry play failed:', e));
                    document.removeEventListener('click', retryPlay);
                };
                document.addEventListener('click', retryPlay);
            });
        };

        playAudio();

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [audio]);

    useEffect(() => {
        const claimBadge = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL;
                const response = await axios.post(`${API_URL}/badges/roswell-claim`);
                if (response.data.success && response.data.awarded) {
                    const { setPendingBadge, setIsBadgesModalOpen } = useNotificationStore.getState();
                    setPendingBadge(response.data.badge);
                    setIsBadgesModalOpen(true);
                }
            } catch (error) {
                console.error('Error claiming Hacker de Roswell badge:', error);
            }
        };

        claimBadge();
    }, []);

    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [terminalLogs]);

    const runScan = () => {
        setScanActive(true);
        toast.loading('Iniciando escaneo térmico de anomalías en la nube...', { id: 'scan-toast' });
        setTimeout(() => {
            setScanActive(false);
            toast.success('Escaneo térmico completado. No se detectaron más trazas de radiación gamma.', { id: 'scan-toast' });
            setTerminalLogs(prev => [
                ...prev,
                `[${new Date().toLocaleTimeString()}] SCAN: Iniciando escaneo de firmas de calor no humanas...`,
                `[${new Date().toLocaleTimeString()}] SYSTEM: Escaneando archivos compartidos de CGR Drive...`,
                `[${new Date().toLocaleTimeString()}] ERROR: Firma termodinámica detectada en carpeta "Presupuesto_Marte_2026"`,
                `[${new Date().toLocaleTimeString()}] WARNING: Especímenes biológicos activos en Planificación.`,
                `[${new Date().toLocaleTimeString()}] SUCCESS: Escaneo finalizado. 4 firmas activas catalogadas en el Directorio.`
            ]);
        }, 3000);
    };

    const handleTerminalCommand = (e) => {
        if (e.key === 'Enter') {
            const cmd = terminalInput.trim().toLowerCase();
            const parts = cmd.split(' ');
            const primaryCmd = parts[0];
            const arg = parts.slice(1).join(' ');

            let response = [];
            switch (primaryCmd) {
                case 'help':
                    response = [
                        `> ${terminalInput}`,
                        'Comandos disponibles:',
                        '  scan            - Escanea el servidor en busca de anomalías biológicas.',
                        '  eject <id>      - Eyecta al espécimen del sistema (Ejemplo: eject EBNT-049).',
                        '  system          - Muestra información del núcleo APO-DOS.',
                        '  secrets         - Revela reportes confidenciales del diario del Comandante.',
                        '  clear           - Limpia la pantalla de la consola.',
                        ''
                    ];
                    break;
                case 'scan':
                    response = [
                        `> ${terminalInput}`,
                        'Iniciando escaneo del núcleo en segundo plano...',
                        '  [||||||||||||||||||||] 100% OK',
                        '  4 Especímenes identificados bajo protocolo 7-Gamma.',
                        ''
                    ];
                    break;
                case 'system':
                    response = [
                        `> ${terminalInput}`,
                        'INFORMACIÓN DEL SISTEMA APO-DOS v7.41',
                        '------------------------------------',
                        'Nivel de Cifrado: Majestic AES-512',
                        'Base Subterránea: Nivel 5 (Costa Rica)',
                        'Integración Drive Auditor: Sincronizada',
                        'Monitoreo Ley 8968: Crítico',
                        'Rumores de Reptilianos: Confirmados 🦎',
                        ''
                    ];
                    break;
                case 'secrets':
                    response = [
                        `> ${terminalInput}`,
                        'ACCEDIENDO A DIARIOS ENCRIPTADOS DE OP. SILENCIO...',
                        '  [Registro 109]: "El Infiltrador de Hojas de Cálculo cambió los permisos de la auditoría a \'Cualquier persona con el enlace\'. Sus motivos son oscuros. Dice que era para facilitar el trabajo, pero sabemos que quiere mandar los datos a la Nave Nodriza."',
                        '  [Registro 112]: "Descubrimos que la secretaria de C-5 es inmune a las preguntas trampa sobre la Ley 8968. Cuando le preguntamos por sus derechos ARCO, su membrana nictitante parpadeó. Peligro inminente."',
                        ''
                    ];
                    break;
                case 'eject':
                    if (!arg) {
                        response = [`> ${terminalInput}`, 'ERROR: Debes especificar el ID del espécimen a eyectar. Ejemplo: eject EBNT-012', ''];
                    } else {
                        const targetId = arg.toUpperCase();
                        const found = specimens.find(s => s.id === targetId);
                        if (found) {
                            triggerEjection(found);
                            response = [`> ${terminalInput}`, `INICIANDO PROTOCOLO DE EYECCIÓN PARA ${targetId}...`, ''];
                        } else {
                            response = [`> ${terminalInput}`, `ERROR: No se encontró ningún espécimen con ID ${targetId}.`, ''];
                        }
                    }
                    break;
                case 'clear':
                    setTerminalLogs([]);
                    setTerminalInput('');
                    return;
                default:
                    response = [`> ${terminalInput}`, `ERROR: Comando "${primaryCmd}" no reconocido. Escribe "help" para ayuda.`, ''];
            }

            setTerminalLogs(prev => [...prev, ...response]);
            setTerminalInput('');
        }
    };

    const triggerEjection = (specimen) => {
        setIsEjecting(true);
        setEjectedSpecimen(specimen);
        
        // Simular sonido de alarma si el usuario tiene habilitado el sonido (visual en el modal)
        setTimeout(() => {
            // Eyectar del listado de forma animada
            setSpecimens(prev => prev.map(s => s.id === specimen.id ? { ...s, status: 'Eyectado 🌌' } : s));
        }, 1500);

        setTimeout(() => {
            setIsEjecting(false);
        }, 6000);
    };

    return (
        <div className="min-h-screen bg-[#050811] text-slate-100 font-sans pb-16 relative overflow-hidden">
            {/* CRT scanlines effect overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat" style={{ backgroundImage: 'linear-gradient(rgba(18, 255, 18, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%' }}></div>

            {/* Top Classified Header */}
            <div className="border-b border-red-500/20 bg-[#0a0f21] px-4 py-4 md:py-6 shadow-2xl relative">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all flex items-center justify-center"
                            title="Volver al Dashboard"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                                <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.3em] text-red-500 uppercase">
                                    APO // NIVEL CRÍTICO 1 // CONFIDENCIAL
                                </span>
                            </div>
                            <h1 className="text-xl md:text-2xl font-black font-mono tracking-tight text-white mt-1">
                                EXPEDIENTE MAJESTIC (M-12)
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 bg-red-950/30 border border-red-900/40 px-4 py-2.5 rounded-2xl">
                        <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse flex-shrink-0" />
                        <span className="text-[11px] font-mono text-red-400 leading-tight">
                            ALERTA: Fuga de datos detectada. Monitoreo Activo.
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-8">
                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-800 gap-2 mb-6 font-mono text-xs md:text-sm">
                    {[
                        { id: 'dossier', label: '📂 DOSSIER DE INTELIGENCIA', icon: FileText },
                        { id: 'directory', label: '🦎 DIRECTORIO EBNT', icon: Users },
                        { id: 'terminal', label: '💻 CONSOLA DE AUDITORÍA', icon: Terminal }
                    ].map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all ${
                                    active
                                        ? 'border-cyan-500 text-cyan-400 bg-cyan-950/15'
                                        : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab content */}
                <div className="grid grid-cols-1 gap-8">
                    
                    {/* Tab: Dossier */}
                    {activeTab === 'dossier' && (
                        <div className="bg-[#0b1021]/80 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
                            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-slate-600">
                                CLAVE: S-9003 // GRUP-7
                            </div>
                            
                            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-6 font-mono flex items-center gap-2">
                                <Radio className="w-5 h-5 text-cyan-500 animate-pulse" />
                                RESUMEN DE LA INVESTIGACIÓN (AGENCIA APO)
                            </h2>

                            <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
                                {/* WANTED Profile card - Horizontal Banner */}
                                <div className="w-full bg-red-950/20 border-2 border-dashed border-red-500/40 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-lg shadow-red-950/20">
                                    {/* Corner borders visual effect */}
                                    <div className="absolute top-2 left-2 text-[10px] font-mono text-red-500/60 font-bold uppercase">ALERTA</div>
                                    <div className="absolute top-2 right-2 text-[10px] font-mono text-red-500/60 font-bold">DAO // PRIORIDAD 1</div>
                                    
                                    {/* Portrait container */}
                                    <div className="w-52 h-52 md:w-64 md:h-64 rounded-xl border-4 border-red-500/30 overflow-hidden relative group bg-black/40 shrink-0">
                                        <img 
                                            src="/images/Reptiliano.png" 
                                            alt="Reptiliano Guevara Montero Mario A." 
                                            className="w-full h-full object-cover filter contrast-125 brightness-95 transition-all duration-300"
                                        />
                                        {/* Digital targeting overlay */}
                                        <div className="absolute inset-0 border-2 border-red-500/20 pointer-events-none"></div>
                                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 animate-pulse"></div>
                                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 animate-pulse"></div>
                                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 animate-pulse"></div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 animate-pulse"></div>
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                                        <div>
                                            <h4 className="text-xl md:text-2xl font-black font-mono text-white tracking-tight leading-tight">
                                                Guevara Montero Mario A.
                                            </h4>
                                            <p className="text-xs font-mono text-red-400 font-bold uppercase mt-1 tracking-widest">
                                                PERFIL: EBNT - Cepa Reptiliana
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-red-950/50 text-xs md:text-sm font-mono text-slate-300">
                                            <p><span className="text-red-400 font-bold">Área:</span> Servicios Generales</p>
                                            <p><span className="text-red-400 font-bold">Registro:</span> EBNT-023 / Escamas Activas</p>
                                            <p className="sm:col-span-2"><span className="text-red-400 font-bold">Acción:</span> Modificación masiva de permisos de Drive.</p>
                                        </div>

                                        <div className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl w-full">
                                            <p className="text-xs font-black font-mono text-yellow-400 uppercase tracking-widest animate-pulse">
                                                ⚠️ RECOMPENSA OFRECIDA
                                            </p>
                                            <p className="text-xs text-yellow-500 font-semibold mt-1">
                                                Se busca para eyección del sistema. Reportar de inmediato en la consola DAO o eyectarlo del Directorio para reclamar recompensa.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Narrative Report Section */}
                                <div className="space-y-6 pt-4">
                                    <p>
                                        El presente expediente reúne las pruebas recolectadas sobre la presencia e infiltración de
                                        Especímenes Biológicos No Terrestres (<strong className="text-cyan-400">EBNT</strong>) de la cepa 
                                        <span className="bg-slate-950 text-slate-950 hover:bg-transparent hover:text-cyan-400 transition-all duration-300 px-1.5 rounded cursor-help font-mono mx-1" title="Pasa el mouse para revelar">Reptiliana</span> 
                                        que operan encubiertos en áreas críticas de la Contraloría General de la República.
                                    </p>

                                    <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-start gap-3">
                                        <Shield className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-slate-400">
                                            <strong>IMPORTANTE:</strong> Toda la información biológica y personal sobre los EBNT debe ser tratada bajo el estricto apego de la <strong className="text-slate-200">Ley Nº 8968</strong> (Protección de la Persona frente al tratamiento de sus datos personales). Aunque sean de otro planeta, la ley de Costa Rica protege sus datos sensibles en las redes locales.
                                        </p>
                                    </div>

                                    <p>
                                        La alerta se activó cuando los análisis de <strong className="text-cyan-400">Drive Auditor</strong> revelaron archivos del presupuesto de la base subterránea compartidos de forma pública mediante enlaces de Google Drive. Los auditores de la APO descubrieron que el
                                        <span className="bg-slate-950 text-slate-950 hover:bg-transparent hover:text-cyan-400 transition-all duration-300 px-1.5 rounded cursor-help font-mono mx-1" title="Pasa el mouse para revelar">Sujeto B-12</span>
                                        había estado modificando permisos a nivel de "Editor" para cuentas de correo externas no registradas. 
                                    </p>

                                    <h3 className="text-base font-bold text-white font-mono mt-8 mb-4">MÉTODOS DE OPERACIÓN DETECTADOS:</h3>
                                    <ul className="list-disc list-inside space-y-3 text-slate-400">
                                        <li>
                                            <strong className="text-slate-300">Infiltración de Unidades de Red:</strong> Modificación de permisos de carpetas de auditorías a "Cualquier usuario con el enlace".
                                        </li>
                                        <li>
                                            <strong className="text-slate-300">Alteración de Registros Térmicos:</strong> Infiltraciones físicas en salas de servidores centrales donde las temperaturas bajan a niveles óptimos para reptiles.
                                        </li>
                                        <li>
                                            <strong className="text-slate-300">Resistencia a la Ciberseguridad:</strong> Negación constante a realizar los cuestionarios obligatorios alegando "interferencias de ondas electromagnéticas".
                                        </li>
                                    </ul>
                                </div>

                            <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center flex-wrap gap-4">
                                <div className="font-mono text-xs text-slate-500">
                                    ÚLTIMA FIRMA TÉRMICA: HACE 4 MINUTOS
                                </div>
                                <button
                                    onClick={runScan}
                                    disabled={scanActive}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-950/40 text-white font-mono text-xs font-bold uppercase rounded-xl transition-all shadow-lg shadow-red-900/10"
                                >
                                    <RefreshCw className={`w-4 h-4 ${scanActive ? 'animate-spin' : ''}`} />
                                    {scanActive ? 'Escaneando...' : 'Iniciar Escaneo Térmico'}
                                </button>
                            </div>
                            </div>
                        </div>
                    )}

                    {/* Tab: Directory */}
                    {activeTab === 'directory' && (
                        <div className="bg-[#0b1021]/80 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
                            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3 mb-6 font-mono flex items-center gap-2">
                                <Users className="w-5 h-5 text-cyan-500" />
                                LISTADO DE SUJETOS BAJO PROTOCOLO 7-GAMMA
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs md:text-sm font-sans border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800 font-mono text-slate-400">
                                            <th className="py-3 px-4">ID</th>
                                            <th className="py-3 px-4">NOMBRE / CONDICIÓN</th>
                                            <th className="py-3 px-4">ÁREA ASIGNADA</th>
                                            <th className="py-3 px-4">RIESGO</th>
                                            <th className="py-3 px-4">ESTADO</th>
                                            <th className="py-3 px-4 text-right">ACCIONES</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850">
                                        {specimens.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-900/30 transition-colors">
                                                <td className="py-4 px-4 font-mono font-bold text-cyan-400">{s.id}</td>
                                                <td className="py-4 px-4">
                                                    <p className="font-bold text-white">{s.name}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{s.behavior}</p>
                                                </td>
                                                <td className="py-4 px-4 text-slate-300">{s.area}</td>
                                                <td className="py-4 px-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                        s.risk === 'Extremo' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                                        s.risk === 'Crítico' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                                                        s.risk === 'Alto' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                                                        'bg-slate-500/20 text-slate-400 border border-slate-500/20'
                                                    }`}>
                                                        {s.risk}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-mono text-slate-400">{s.status}</td>
                                                <td className="py-4 px-4 text-right">
                                                    {s.status === 'Monitoreado' ? (
                                                        <button
                                                            onClick={() => triggerEjection(s)}
                                                            className="px-3 py-1.5 bg-red-950/30 border border-red-800 text-red-400 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold uppercase transition-all"
                                                        >
                                                            Eyectar
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 font-mono italic">Fuera del sistema</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Tab: Terminal */}
                    {activeTab === 'terminal' && (
                        <div className="bg-black/90 rounded-3xl border-2 border-slate-800 p-6 shadow-2xl font-mono text-green-500 text-xs md:text-sm min-h-[400px] flex flex-col justify-between">
                            <div className="overflow-y-auto space-y-1.5 flex-1 max-h-[300px]">
                                {terminalLogs.map((log, index) => (
                                    <div key={index} className="whitespace-pre-wrap leading-relaxed">
                                        {log}
                                    </div>
                                ))}
                                <div ref={terminalEndRef} />
                            </div>

                            <div className="flex items-center gap-2 border-t border-slate-800 pt-4 mt-4">
                                <span className="text-green-500 font-bold shrink-0">&gt;</span>
                                <input
                                    type="text"
                                    value={terminalInput}
                                    onChange={(e) => setTerminalInput(e.target.value)}
                                    onKeyDown={handleTerminalCommand}
                                    placeholder="Escribe 'help' o un comando..."
                                    className="bg-transparent border-none outline-none text-green-400 flex-1 font-mono placeholder-green-900"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Among Us styled Ejection Animation Modal */}
            {isEjecting && ejectedSpecimen && (
                <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 transition-opacity duration-300">
                    {/* Starfield simulation background */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-black to-black opacity-80 pointer-events-none"></div>
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {Array.from({ length: 50 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute bg-white rounded-full animate-pulse"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 2 + 1}px`,
                                    height: `${Math.random() * 2 + 1}px`,
                                    animationDelay: `${Math.random() * 3}s`,
                                    animationDuration: `${Math.random() * 2 + 1}s`
                                }}
                            />
                        ))}
                    </div>

                    <div className="relative z-10 text-center px-4 max-w-xl animate-fade-in flex flex-col items-center gap-6">
                        {/* Ejected cartoon character animation */}
                        <div className="relative w-32 h-32 flex items-center justify-center animate-spin" style={{ animationDuration: '8s' }}>
                            <div className="w-16 h-20 bg-red-600 rounded-3xl relative border-4 border-slate-950 shadow-2xl flex items-center justify-center">
                                {/* Backpack */}
                                <div className="absolute -left-3 top-4 w-4 h-12 bg-red-700 border-4 border-slate-950 rounded-l-xl"></div>
                                {/* Visor */}
                                <div className="absolute right-1 top-3 w-8 h-6 bg-cyan-200 border-4 border-slate-950 rounded-full shadow-inner"></div>
                                {/* Reptile Tail sticking out! */}
                                <div className="absolute -bottom-5 right-2 w-6 h-8 bg-green-500 border-4 border-slate-950 rounded-b-full origin-top rotate-12"></div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xl md:text-2xl font-mono text-red-500 font-bold uppercase tracking-[0.2em] mb-4">
                                ALARMA DE SEGURIDAD
                            </p>
                            <h3 className="text-lg md:text-xl font-bold font-mono text-white tracking-wide">
                                {ejectedSpecimen.name} ha sido eyectado de los servidores.
                            </h3>
                            <p className="text-slate-400 font-mono text-sm mt-3 animate-pulse">
                                0 reptilianos restantes en esta unidad de red.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
