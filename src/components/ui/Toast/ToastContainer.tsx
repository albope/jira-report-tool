// src/components/ui/Toast/ToastContainer.tsx
"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "./ToastContext";
import { ToastItem } from "./ToastItem";

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-label="Notificaciones"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};
