import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Mantenemos una lista de sonidos activos fuera del estado persistido para evitar errores de serialización
const activeSounds = new Set();

export const useSoundStore = create(
    persist(
        (set, get) => ({
            isMuted: true,
            volume: 0.5,
            
            toggleMute: () => {
                const nextMuted = !get().isMuted;
                set({ isMuted: nextMuted });
                
                // Aplicar a todos los sonidos activos inmediatamente
                activeSounds.forEach(audio => {
                    audio.muted = nextMuted;
                    // También ajustamos volumen por si acaso el navegador ignora .muted en algunos contextos
                    audio.volume = nextMuted ? 0 : get().volume;
                });
            },

            setVolume: (volume) => {
                set({ volume });
                activeSounds.forEach(audio => {
                    if (!get().isMuted) audio.volume = volume;
                });
            },

            playSound: (soundPath) => {
                const { isMuted, volume } = get();
                
                const audio = new Audio(soundPath);
                audio.volume = isMuted ? 0 : volume;
                audio.muted = isMuted;
                
                // Registrar para control global
                activeSounds.add(audio);
                audio.onended = () => activeSounds.delete(audio);
                
                audio.play().catch(e => {
                    //console.log('Audio play blocked:', e);
                    activeSounds.delete(audio);
                });
                
                return audio;
            }
        }),
        {
            name: 'cgr-sound-settings',
            partialize: (state) => ({ isMuted: state.isMuted, volume: state.volume }),
        }
    )
);
