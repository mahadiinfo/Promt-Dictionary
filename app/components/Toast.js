"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Check } from "lucide-react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, leaving: false }]);
    // begin exit animation
    setTimeout(() => {
      setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    }, 1600);
    // remove after exit
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 1900);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`mb-2 flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm font-medium shadow-lg ${
              t.leaving ? "toast-leave" : "toast-enter"
            }`}
          >
            <Check className="h-4 w-4 text-emerald-500" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
