"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (content: string, fileName: string) => void;
  accept?: string;
  maxSize?: number; // en bytes
  className?: string;
}

type UploadState = "idle" | "dragging" | "uploading" | "success" | "error";

/**
 * Componente de carga de archivos con drag & drop.
 * Soporta archivos de texto (.txt, .json, .csv, etc.)
 */
export function FileUpload({
  onFileSelect,
  accept = ".txt,.json,.csv,.xml",
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  className = "",
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);

      // Validar tamaño
      if (file.size > maxSize) {
        setError(`El archivo excede el tamaño máximo de ${Math.round(maxSize / 1024 / 1024)}MB`);
        setState("error");
        return;
      }

      // Validar tipo (básico)
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (accept && !accept.includes(extension) && !accept.includes("*")) {
        setError(`Tipo de archivo no soportado. Usa: ${accept}`);
        setState("error");
        return;
      }

      setState("uploading");
      setFileName(file.name);

      try {
        const content = await file.text();

        // Simular un pequeño delay para mostrar la animación
        await new Promise((resolve) => setTimeout(resolve, 500));

        onFileSelect(content, file.name);
        setState("success");
      } catch {
        setError("Error al leer el archivo");
        setState("error");
      }
    },
    [accept, maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState("dragging");
  }, []);

  const handleDragLeave = useCallback(() => {
    setState("idle");
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const reset = useCallback(() => {
    setState("idle");
    setFileName(null);
    setError(null);
  }, []);

  const stateStyles = {
    idle: "border-[var(--surface-border)] dark:border-white/10 hover:border-[var(--primary)]/50",
    dragging: "border-[var(--primary)] bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10 scale-[1.02]",
    uploading: "border-[var(--primary)]/50",
    success: "border-[var(--success)] bg-[var(--success-soft)]",
    error: "border-[var(--error)] bg-[var(--error-soft)]",
  };

  return (
    <motion.div
      className={`
        relative rounded-xl border-2 border-dashed
        transition-all duration-200
        ${stateStyles[state]}
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      animate={state === "dragging" ? { scale: 1.02 } : { scale: 1 }}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        disabled={state === "uploading"}
      />

      <div className="p-8 flex flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="
                w-14 h-14 rounded-xl mb-4
                bg-[var(--surface-hover)] dark:bg-white/5
                flex items-center justify-center
              ">
                <Upload className="w-6 h-6 text-[var(--foreground-tertiary)]" />
              </div>
              <p className="text-[var(--foreground)] font-medium mb-1">
                Arrastra un archivo aquí
              </p>
              <p className="text-sm text-[var(--foreground-tertiary)]">
                o haz clic para seleccionar
              </p>
              <p className="text-xs text-[var(--foreground-muted)] mt-2">
                Formatos: {accept} · Máx: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </motion.div>
          )}

          {state === "dragging" && (
            <motion.div
              key="dragging"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center"
            >
              <div className="
                w-14 h-14 rounded-xl mb-4
                bg-[var(--primary)]/20
                flex items-center justify-center
              ">
                <Upload className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <p className="text-[var(--primary)] font-medium">
                Suelta el archivo aquí
              </p>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="w-14 h-14 rounded-xl mb-4 bg-[var(--primary)]/20 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <File className="w-6 h-6 text-[var(--primary)]" />
              </motion.div>
              <p className="text-[var(--foreground)] font-medium">
                Procesando...
              </p>
              <p className="text-sm text-[var(--foreground-tertiary)]">
                {fileName}
              </p>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="
                w-14 h-14 rounded-xl mb-4
                bg-[var(--success)]/20
                flex items-center justify-center
              ">
                <CheckCircle className="w-6 h-6 text-[var(--success)]" />
              </div>
              <p className="text-[var(--success-soft-foreground)] font-medium">
                Archivo cargado
              </p>
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                {fileName}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="
                  inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                  text-xs font-medium
                  bg-[var(--surface)] dark:bg-white/10
                  text-[var(--foreground-secondary)]
                  hover:text-[var(--foreground)]
                  transition-colors z-20 relative
                "
              >
                <X className="w-3 h-3" />
                Cambiar archivo
              </button>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="
                w-14 h-14 rounded-xl mb-4
                bg-[var(--error)]/20
                flex items-center justify-center
              ">
                <AlertCircle className="w-6 h-6 text-[var(--error)]" />
              </div>
              <p className="text-[var(--error-soft-foreground)] font-medium">
                Error
              </p>
              <p className="text-sm text-[var(--foreground-secondary)] mb-3">
                {error}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  reset();
                }}
                className="
                  inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                  text-xs font-medium
                  bg-[var(--surface)] dark:bg-white/10
                  text-[var(--foreground-secondary)]
                  hover:text-[var(--foreground)]
                  transition-colors z-20 relative
                "
              >
                Intentar de nuevo
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default FileUpload;
