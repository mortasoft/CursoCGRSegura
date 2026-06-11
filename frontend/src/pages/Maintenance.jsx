import React from 'react';
import { useMaintenance } from '../hooks/useMaintenance';
import MaintenanceBackground from '../components/maintenance/MaintenanceBackground';
import CyberCatMaintenance from '../components/maintenance/CyberCatMaintenance';
import MaintenanceInfo from '../components/maintenance/MaintenanceInfo';

export default function Maintenance() {
    const { goHome } = useMaintenance();

    return (
        <div className="h-screen w-full bg-[#161b33] flex items-center justify-center p-4 relative overflow-hidden font-sans select-none">
            <MaintenanceBackground />

            <div className="max-w-xl w-full text-center space-y-8 relative z-10">
                <CyberCatMaintenance />
                <MaintenanceInfo />
            </div>

            {/* Custom Styles for animations */}
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
