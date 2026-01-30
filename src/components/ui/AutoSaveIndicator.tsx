// src/components/ui/AutoSaveIndicator.tsx
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  lastSaved,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 text-xs"
      >
        {status === "idle" && (
          <span className="text-gray-400 flex items-center gap-1.5">
            <Cloud className="w-3.5 h-3.5" />
            <span>Auto-guardado activado</span>
          </span>
        )}

        {status === "saving" && (
          <span className="text-blue-500 flex items-center gap-1.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-3.5 h-3.5" />
            </motion.div>
            <span>Guardando...</span>
          </span>
        )}

        {status === "saved" && (
          <span className="text-emerald-600 flex items-center gap-1.5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className="w-3.5 h-3.5" />
            </motion.div>
            <span>
              Guardado {lastSaved && `a las ${formatTime(lastSaved)}`}
            </span>
          </span>
        )}

        {status === "error" && (
          <span className="text-red-500 flex items-center gap-1.5">
            <CloudOff className="w-3.5 h-3.5" />
            <span>Error al guardar</span>
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
