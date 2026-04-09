import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSoundStore = create(
    persist(
        (set) => ({
            isMuted: false,
            volume: 0.5,
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
            setVolume: (volume) => set({ volume }),
            playSound: (soundPath) => {
                const { isMuted, volume } = useSoundStore.getState();
                if (isMuted) return null;

                const audio = new Audio(soundPath);
                audio.volume = volume;
                audio.play().catch(e => console.log('Audio play blocked or failed:', e));
                return audio;
            }
        }),
        {
            name: 'cgr-sound-settings',
        }
    )
);
