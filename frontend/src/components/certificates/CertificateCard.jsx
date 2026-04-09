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
            <div className="relative z-10 h-full flex flex-col items-center justify-between py-8 px-16 text-center">

                {/* Header */}
                <div className="space-y-1">
                    <div className="w-28 h-28 mx-auto">
                        <img src="/images/logo-cgr.webp" alt="Logo CGR" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-5xl font-serif text-primary-900 tracking-wider font-bold">CERTIFICADO</h1>
                    <p className="text-xl font-medium text-secondary-600 uppercase tracking-[0.3em]">DE FINALIZACIÓN</p>
                    <p className="text-gray-500 font-serif italic text-lg pt-1">Se otorga el presente reconocimiento a:</p>
                </div>

                {/* Name + Module */}
                <div className="space-y-4 max-w-4xl w-full">
                    <div className="relative inline-block w-full max-w-2xl mx-auto">
                        <h2 className="text-5xl font-bold text-slate-900 font-serif border-b-2 border-slate-200 pb-5 px-12 block w-full uppercase tracking-tight">
                            {certificate.first_name || user.first_name} {certificate.last_name || user.last_name}
                        </h2>
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white px-3">
                            <Award className="w-10 h-10 text-secondary-500 fill-secondary-100" />
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <p className="text-gray-600 font-serif text-base leading-relaxed">
                            Por haber completado satisfactoriamente el módulo de capacitación en seguridad de la información del curso <span className="font-bold text-primary-900 uppercase">"CGR Segura"</span> el día <strong>{new Date(certificate.issued_at).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>:
                        </p>

                        <div className="py-5 px-10 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner inline-block">
                            <h3 className="text-4xl font-bold text-primary-800 font-serif uppercase tracking-tight">
                                "{certificate.module_title}"
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Footer: ID del Documento only */}
                <div className="flex items-center gap-2 w-full border-t border-slate-100 pt-3">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.25em] whitespace-nowrap">ID:</p>
                    <p className="text-xs text-slate-900 uppercase tracking-widest">
                        {certificate.certificate_code}
                    </p>
                </div>
            </div>
        </div>
    );
}
