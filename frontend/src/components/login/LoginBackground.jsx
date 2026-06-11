import React from 'react';

export default function LoginBackground() {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Background Image */}
            <img 
                src="/images/Inicio-opcion-1.jpg" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover"
            />
        </div>
    );
}

