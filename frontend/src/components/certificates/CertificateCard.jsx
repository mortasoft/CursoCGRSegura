import { Award } from 'lucide-react';

export default function CertificateCard({ certificate, user }) {
    if (!certificate) return null;

    return (
        <div 
            id="certificate-print" 
            className="relative w-full max-w-[1100px] aspect-[1.414/1] bg-white text-slate-900 shadow-2xl overflow-hidden print:shadow-none print:w-full print:h-full print:absolute print:top-0 print:left-0 print:m-0 animate-scale-in rounded-sm"
        >
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
                        <img src="/images/logo-cgr.webp" alt="Logo CGR" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-5xl font-serif text-primary-900 tracking-wider font-bold">CERTIFICADO</h1>
                    <p className="text-xl font-medium text-secondary-600 uppercase tracking-[0.3em]">DE FINALIZACIÓN</p>
                </div>

                {/* Main Text Area */}
                <div className="space-y-6 max-w-4xl w-full">
                    <p className="text-gray-500 font-serif italic text-xl">Se otorga el presente reconocimiento a:</p>

                    <div className="relative inline-block w-full max-w-2xl mx-auto">
                        <h2 className="text-5xl font-bold text-slate-900 font-serif border-b-2 border-slate-200 pb-6 px-12 block w-full uppercase tracking-tight">
                            {certificate.first_name || user.first_name} {certificate.last_name || user.last_name}
                        </h2>
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-3">
                            <Award className="w-10 h-10 text-secondary-500 fill-secondary-100" />
                        </div>
                    </div>

                    <div className="pt-6 space-y-4">
                        <p className="text-gray-600 font-serif text-lg leading-relaxed">
                            Por haber completado satisfactoriamente el módulo de capacitación en seguridad de la información del curso <span className="font-bold text-primary-900 uppercase">"CGR Segura"</span> del mes de <strong>{certificate.module_month || 'Marzo'}</strong>:
                        </p>

                        <div className="py-6 px-10 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner inline-block">
                            <h3 className="text-4xl font-bold text-primary-800 font-serif uppercase tracking-tight">
                                "{certificate.module_title}"
                            </h3>
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex justify-between items-end max-w-4xl mx-auto pt-8 border-t border-slate-100 mt-12">
                        <div className="text-left flex items-center gap-10">
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1 leading-none">FECHA DE EMISIÓN</p>
                                <p className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                                    {new Date(certificate.issued_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="w-px h-8 bg-slate-200"></div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1 leading-none">CÓDIGO DE VALIDACIÓN</p>
                                <p className="text-sm font-mono font-bold text-slate-900 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                    {certificate.certificate_code}
                                </p>
                            </div>
                        </div>

                        {/* Institution Info */}
                        <div className="text-right flex flex-col items-end gap-1">
                            <img src="/images/logo-cgr.webp" alt="" className="w-16 h-16 opacity-10 mb-2 grayscale" />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Emitido por</p>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Contraloría General de la República</p>
                            <p className="text-[9px] font-bold text-primary-600/60 uppercase tracking-widest">División de Seguridad Institucional</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
