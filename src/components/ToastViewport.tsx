import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useToast } from '../context/ToastContext';

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2.5 w-full max-w-sm pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon =
            toast.type === 'success'
              ? CheckCircle2
              : toast.type === 'error'
                ? AlertCircle
                : Info;

          const accent =
            toast.type === 'success'
              ? 'text-emerald-600'
              : toast.type === 'error'
                ? 'text-red-600'
                : 'text-[#E85D2A]';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="pointer-events-auto bg-white border border-stone-200 shadow-lg p-4 flex items-start gap-3"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${accent}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827]">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-stone-500 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
