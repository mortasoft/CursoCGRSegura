import React from 'react';
import DriveAuditorActivity from '../components/lessons/activities/DriveAuditorActivity';

export default function DriveAuditorStandalone() {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4">
            <div className="w-full max-w-3xl mt-8">
                <DriveAuditorActivity 
                    isStandalone={true}
                    item={{ content: {} }} 
                    data={{}} 
                    playSuccess={() => console.log('playSuccess')} 
                    playError={() => console.log('playError')} 
                />
            </div>
        </div>
    );
}
