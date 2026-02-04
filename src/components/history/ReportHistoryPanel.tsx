// src/components/history/ReportHistoryPanel.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  X,
  Loader2,
  Trash2,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReportHistoryAPI as useReportHistory, type SavedReport } from "@/hooks/useReportHistoryAPI";
import { ReportHistoryItem } from "./ReportHistoryItem";
import { useConfirm, ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ReportHistoryPanelProps {
  /** Si el panel está abierto */
  isOpen: boolean;
  /** Callback para cerrar el panel */
  onClose: () => void;
  /** Callback cuando se selecciona un reporte para cargar */
  onLoadReport: (report: SavedReport) => void;
}

export const ReportHistoryPanel: React.FC<ReportHistoryPanelProps> = ({
  isOpen,
  onClose,
  onLoadReport,
}) => {
  const {
    reports,
    totalCount,
    isLoading,
    error,
    removeReport,
    search,
    refresh,
    clearHistory,
  } = useReportHistory();

  const { confirm, ConfirmDialog: ConfirmDialogComponent } = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    search(query);
  };

  // Manejar selección de reporte
  const handleSelectReport = (report: SavedReport) => {
    setSelectedId(report.id);
    onLoadReport(report);
    onClose();
  };

  // Manejar eliminación de reporte
  const handleDeleteReport = async (id: string) => {
    const confirmed = await confirm({
      title: "Eliminar reporte",
      message: "¿Estás seguro de que deseas eliminar este reporte del historial? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      await removeReport(id);
    }
  };

  // Manejar limpieza del historial
  const handleClearHistory = async () => {
    const confirmed = await confirm({
      title: "Limpiar historial",
      message: `¿Estás seguro de que deseas eliminar los ${totalCount} reportes del historial? Esta acción no se puede deshacer.`,
      confirmText: "Limpiar todo",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      await clearHistory();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={onClose}
            />

            {/* Panel lateral */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-[var(--surface)] dark:bg-[var(--background)] border-l border-[var(--surface-border)] dark:border-white/10 shadow-2xl"
            >
              {/* Header */}
              <div className="flex-shrink-0 px-6 py-4 border-b border-[var(--surface-border)] dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[var(--foreground)]">
                        Historial
                      </h2>
                      <p className="text-xs text-[var(--foreground-secondary)]">
                        {totalCount} reporte{totalCount !== 1 ? "s" : ""} guardado{totalCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Búsqueda */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-secondary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Buscar por JIRA, título o tester..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        search("");
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de reportes */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Loading */}
                {isLoading && (
                  <div className="py-12 flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Cargando historial...
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && !isLoading && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-red-500 mb-3">{error}</p>
                    <Button variant="secondary" size="sm" onClick={refresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Reintentar
                    </Button>
                  </div>
                )}

                {/* Lista vacía */}
                {!isLoading && !error && reports.length === 0 && (
                  <div className="py-12 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
                      <FolderOpen className="w-8 h-8 text-[var(--foreground-secondary)]" />
                    </div>
                    <div className="text-center">
                      <p className="text-[var(--foreground)] font-medium">
                        {searchQuery ? "Sin resultados" : "Historial vacío"}
                      </p>
                      <p className="text-sm text-[var(--foreground-secondary)] mt-1">
                        {searchQuery
                          ? "Prueba con otros términos de búsqueda"
                          : "Los reportes que generes aparecerán aquí"
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Lista de reportes */}
                {!isLoading && !error && reports.length > 0 && (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {reports.map((report) => (
                        <ReportHistoryItem
                          key={report.id}
                          report={report}
                          onSelect={handleSelectReport}
                          onDelete={handleDeleteReport}
                          isSelected={selectedId === report.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              {totalCount > 0 && (
                <div className="flex-shrink-0 px-6 py-4 border-t border-[var(--surface-border)] dark:border-white/10 bg-[var(--surface-hover)] dark:bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleClearHistory}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpiar historial
                    </Button>
                    <Button variant="secondary" size="sm" onClick={refresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmDialogComponent />
    </>
  );
};

export default ReportHistoryPanel;
