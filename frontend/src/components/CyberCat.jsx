import React from 'react';

export default function CyberCat({ className = "w-12 h-12", color = "#28a9e0", variant = "normal" }) {
    const isPanic = variant === "panic";
    const accessoryColor = isPanic ? "#ef4444" : color;

    return (
        <svg viewBox="0 0 200 200" className={`${className} drop-shadow-lg ${variant !== 'static' ? 'animate-float' : ''}`}>
            {/* Ears */}
            <path d="M50 60 L30 10 L80 40 Z" fill="#ffffff" />
            <path d="M150 60 L170 10 L120 40 Z" fill="#ffffff" />
            <path d="M55 55 L40 25 L75 42 Z" fill="#ffccd5" />
            <path d="M145 55 L160 25 L125 42 Z" fill="#ffccd5" />

            {/* Face */}
            <circle cx="100" cy="100" r="70" fill="#ffffff" />

            {/* Cyber Goggles */}
            <rect x="40" y="80" width="120" height="35" rx="10" fill="#1a2245" />
            <rect x="45" y="85" width="50" height="25" rx="5" fill={accessoryColor} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="105" y="85" width="50" height="25" rx="5" fill={accessoryColor} opacity="0.8">
                <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" begin="0.5s" />
            </rect>

            {/* Goggle strap */}
            <path d="M40 97.5 Q20 97.5 30 97.5" stroke="#1a2245" strokeWidth="10" />
            <path d="M160 97.5 Q180 97.5 170 97.5" stroke="#1a2245" strokeWidth="10" />

            {/* Nose and mouth */}
            <path d="M95 125 Q100 130 105 125" stroke="#ffccd5" strokeWidth="3" fill="none" />
            <path d="M100 120 L100 115" stroke="#ffccd5" strokeWidth="2" />
            <circle cx="100" cy="118" r="4" fill="#ffccd5" />

            {/* Whiskers */}
            <line x1="30" y1="120" x2="60" y2="115" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="30" y1="130" x2="60" y2="125" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="170" y1="120" x2="140" y2="115" stroke="#f0f0f0" strokeWidth="1" />
            <line x1="170" y1="130" x2="140" y2="125" stroke="#f0f0f0" strokeWidth="1" />

            {/* Hoodie */}
            <path d="M40 155 Q100 140 160 155 L160 200 L40 200 Z" fill="#1a2245" />
            <path d="M100 150 L80 180 L120 180 Z" fill={accessoryColor} opacity="0.2" />
        </svg>
    );
}
