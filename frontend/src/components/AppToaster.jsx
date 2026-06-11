import React from 'react';
import { Toaster, resolveValue } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ganaIcon from '../assets/Gana.svg';
import pierdeIcon from '../assets/Pierde.svg';
import infoColibri from '../assets/InfoColibri.svg';

/**
 * Componente Presentacional: ToastBubble (Pattern Section 1)
 * Se encarga puramente de la representación visual del mensaje estilo cómic.
 */
const ToastBubble = ({ t, message, icon }) => {
  const isSuccess = t.type === 'success';
  const isError = t.type === 'error';
  const isLoading = t.type === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ 
        opacity: t.visible ? 1 : 0, 
        y: t.visible ? 0 : 20, 
        scale: t.visible ? 1 : 0.8 
      }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20 
      }}
      className={`${t.className} flex items-center gap-2`}
    >
      {/* Icono (CyberCat o Gana) */}
      <div className="relative z-10 drop-shadow-xl pointer-events-auto">
        {icon || (
          isLoading ? (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <img src={infoColibri} alt="Loading" className="w-36 h-36 object-contain" style={{ transform: 'scaleX(-1)' }} />
            </motion.div>
          ) : isSuccess ? (
            <img src={ganaIcon} alt="Success" className="w-36 h-36 object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-comic-pop" />
          ) : isError ? (
            <img src={pierdeIcon} alt="Error" className="w-36 h-36 object-contain drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-comic-pop" />
          ) : (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <img src={infoColibri} alt="Info" className="w-36 h-36 object-contain" style={{ transform: 'scaleX(-1)' }} />
            </motion.div>
          )
        )}
      </div>

      {/* Contenido de la burbuja */}
      <div 
        role="alert"
        aria-live="polite"
        className={`comic-bubble-content shadow-2xl ${
          isSuccess ? 'comic-bubble-success' : 
          isError ? 'comic-bubble-error' : 
          isLoading ? 'comic-bubble-info border-primary-500/50' : ''
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
};

export default function AppToaster() {
  return (
    <Toaster
      position="bottom-center"
      gutter={12}
      toastOptions={{
        duration: 5000,
        // Clases base para el Toaster
        className: 'comic-bubble-toast pointer-events-none',
        style: {
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          padding: 0,
        },
      }}
    >
      {(t) => (
        <AnimatePresence mode="wait">
          <ToastBubble 
            key={t.id}
            t={t}
            message={resolveValue(t.message, t)}
            icon={t.icon}
          />
        </AnimatePresence>
      )}
    </Toaster>
  );
}
