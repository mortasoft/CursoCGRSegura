import { useState } from 'react';
import {
    Settings,
    Trophy,
    Loader2
} from 'lucide-react';
import { useAdminSettings } from '../hooks/useAdminSettings';

// Components
import AdminSettingsHeader from '../components/admin/settings/AdminSettingsHeader';
import LevelsConfigTab from '../components/admin/settings/LevelsConfigTab';
import SecurityTab from '../components/admin/settings/SecurityTab';

export default function AdminSettings() {
    const { 
        settings, 
        loading, 
        saving, 
        updateLevel, 
        toggleMaintenance, 
        saveSettings,
        refreshLeaderboard
    } = useAdminSettings();
    const [activeTab, setActiveTab] = useState('levels');

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-fade-in space-y-8">
                <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-[6px] border-primary-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-[6px] border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <Settings className="absolute inset-0 m-auto w-8 h-8 text-primary-500 opacity-60 animate-pulse" />
                </div>
                <p className="text-gray-500 font-extrabold uppercase tracking-[0.4em] italic text-xs animate-pulse opacity-80">Sincronizando Matriz del Sistema...</p>
            </div>
        );
    }

    const tabs = [
        { id: 'levels', label: 'Estructura de Niveles', icon: Trophy },
        { id: 'general', label: 'Ajustes Generales', icon: Settings }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-10 animate-fade-in pb-20 px-8 text-left">
            {/* Header with Navigation and Save Action */}
            <AdminSettingsHeader 
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onSave={saveSettings}
                saving={saving}
            />

            {/* Content Area Rendering focused tab content */}
            <main className="min-h-[500px]">
                    {activeTab === 'levels' && (
                    <LevelsConfigTab 
                        levels={settings.levels}
                        onUpdateLevel={updateLevel}
                        onRefreshRanking={refreshLeaderboard}
                        onSave={saveSettings}
                        saving={saving}
                    />
                )}

                {activeTab === 'general' && (
                    <SecurityTab 
                        maintenanceMode={settings.maintenanceMode}
                        onToggleMaintenance={toggleMaintenance}
                    />
                )}
            </main>
        </div>
    );
}
