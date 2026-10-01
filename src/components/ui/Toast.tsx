'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X, Undo2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onUndo?: () => void;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number, onUndo?: () => void) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000, onUndo?: () => void) => {
      const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newToast: ToastItem = { id, message, type, duration, onUndo };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100 shadow-emerald-950/50'
                  : isError
                  ? 'bg-rose-950/90 border-rose-500/30 text-rose-100 shadow-rose-950/50'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-500/30 text-amber-100 shadow-amber-950/50'
                  : 'bg-slate-900/90 border-slate-700/60 text-slate-100 shadow-slate-950/50'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {isSuccess && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
                {isError && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
                {isWarning && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
                {!isSuccess && !isError && !isWarning && (
                  <Info size={16} className="text-cyan-400 shrink-0" />
                )}
                <span className="text-xs font-medium truncate">{toast.message}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {toast.onUndo && (
                  <button
                    onClick={() => {
                      toast.onUndo?.();
                      removeToast(toast.id);
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                  >
                    <Undo2 size={12} />
                    Undo
                  </button>
                )}
                <button
                  onClick={() => removeToast(toast.id)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      showToast: (msg: string) => console.log('Toast:', msg),
      removeToast: () => {},
    };
  }
  return context;
};
