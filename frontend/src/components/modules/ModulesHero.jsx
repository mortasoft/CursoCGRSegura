export default function ModulesHero() {
    return (
        <div className="relative rounded-[2rem] overflow-hidden border border-[#e8dbbe] shadow-xl bg-white">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/images/Inicio-opcion-1.jpg"
                    alt="Hero Background"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #e8dbbe 0%, #e8dbbe 70%, #f6efe2 100%)', opacity: 0.5 }}></div>
            </div>

            <div className="relative z-10 p-6 md:p-8 flex flex-col lg:flex-row justify-between items-center gap-6">
                <div className="space-y-4 max-w-2xl text-center lg:text-left">
                    <h1
                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text"
                        style={{
                            backgroundImage: 'linear-gradient(to right, #582c19 0%, #582c19 45%, #8f032a 100%)'
                        }}
                    >
                        Ruta de Aprendizaje
                    </h1>
                    <p className="text-[#582c19] text-sm md:text-base font-medium max-w-lg">
                        Explora los contenidos diseñados para fortalecer tu conocimiento en ciberseguridad.
                    </p>
                </div>
            </div>
        </div>
    );
}
