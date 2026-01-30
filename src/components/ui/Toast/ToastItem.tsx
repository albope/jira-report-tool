// src/components/ui/Toast/ToastItem.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast, ToastType } from "./ToastContext";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

const styleMap: Record<ToastType, { bg: string; border: string; icon: string; progress: string }> = {
  success: {
    bg: "bg-gradient-to-r from-emerald-50 to-green-50",
    border: "border-emerald-200",
    icon: "text-emerald-600",
    progress: "bg-emerald-500",
  },
  error: {
    bg: "bg-gradient-to-r from-red-50 to-rose-50",
    border: "border-red-200",
    icon: "text-red-600",
    progress: "bg-red-500",
  },
  warning: {
    bg: "bg-gradient-to-r from-amber-50 to-yellow-50",
    border: "border-amber-200",
    icon: "text-amber-600",
    progress: "bg-amber-500",
  },
  info: {
    bg: "bg-gradient-to-r from-blue-50 to-indigo-50",
    border: "border-blue-200",
    icon: "text-blue-600",
    progress: "bg-blue-500",
  },
};

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 4000;
  const styles = styleMap[toast.type];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - 100 / (duration / 50);
        if (newProgress <= 0) {
          clearInterval(interval);
          onRemove(toast.id);
          return 0;
        }
        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [duration, isPaused, onRemove, toast.id]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40,
        mass: 1,
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`
        relative overflow-hidden
        w-full max-w-sm
        ${styles.bg} ${styles.border}
        border rounded-xl shadow-lg shadow-black/5
        backdrop-blur-sm
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${styles.icon}`}>
            {iconMap[toast.type]}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm text-gray-600 leading-relaxed">{toast.message}</p>
            )}
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => onRemove(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <motion.div
          className={`h-full ${styles.progress}`}
          initial={{ width: "100%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
};
