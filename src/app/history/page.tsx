// src/app/history/page.tsx
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  History,
  Search,
  ArrowLeft,
  Loader2,
  Trash2,
  RefreshCw,
  FolderOpen,
  Filter,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReportHistoryAPI as useReportHistory, type SavedReport } from "@/hooks/useReportHistoryAPI";
import { ReportHistoryItem } from "@/components/history";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const router = useRouter();
  const {
    reports,
    totalCount,
    isLoading,
    error,
    removeReport,
    search,
    refresh,
    clearHistory,
  } = useReportHistory(100); // Cargar más en página completa

  const { confirm, ConfirmDialog } = useConfirm();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Filtrar por estado
  const filteredReports = filterStatus
    ? reports.filter(r => r.metadata.testStatus.toLowerCase() === filterStatus.toLowerCase())
    : reports;

  // Manejar búsqueda
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    search(query);
  };

  // Manejar selección de reporte
  const handleSelectReport = (report: SavedReport) => {
    // Guardar en sessionStorage y redirigir al generador
    sessionStorage.setItem("loadReportFromHistory", report.id);
    router.push("/generate-report?step=2");
  };

  // Manejar eliminación de reporte
  const handleDeleteReport = async (id: string) => {
    const confirmed = await confirm({
      title: "Eliminar reporte",
      message: "¿Estás seguro de que deseas eliminar este reporte del historial?",
      confirmText: "Eliminar",
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
      message: `¿Eliminar los ${totalCount} reportes? Esta acción no se puede deshacer.`,
      confirmText: "Limpiar todo",
      variant: "danger",
    });

    if (confirmed) {
      await clearHistory();
    }
  };

  // Exportar historial (exporta los reportes cargados actualmente)
  const handleExport = async () => {
    try {
      const json = JSON.stringify(reports, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jira-reports-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error al exportar:", err);
    }
  };

  // Estadísticas rápidas
  const stats = {
    total: totalCount,
    exitosos: reports.filter(r => r.metadata.testStatus === "Exitoso").length,
    fallidos: reports.filter(r => r.metadata.testStatus === "Fallido").length,
    bloqueados: reports.filter(r => r.metadata.testStatus === "Bloqueado").length,
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--surface-border)] dark:border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--foreground)]">
                    Historial de Reportes
                  </h1>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {totalCount} reporte{totalCount !== 1 ? "s" : ""} guardado{totalCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleExport} disabled={totalCount === 0}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "bg-blue-500" },
            { label: "Exitosos", value: stats.exitosos, color: "bg-green-500" },
            { label: "Fallidos", value: stats.fallidos, color: "bg-red-500" },
            { label: "Bloqueados", value: stats.bloqueados, color: "bg-amber-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                <span className="text-xs text-[var(--foreground-secondary)]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Buscar por JIRA, título o tester..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--surface)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            />
          </div>

          {/* Filtro de estado */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--foreground-secondary)]" />
            <select
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-3 py-2.5 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--surface)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
            >
              <option value="">Todos los estados</option>
              <option value="exitoso">Exitoso</option>
              <option value="fallido">Fallido</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
          </div>

          <Button variant="secondary" size="md" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
        </div>

        {/* Lista de reportes */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            <p className="text-[var(--foreground-secondary)]">Cargando historial...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="py-12 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button variant="secondary" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {!isLoading && !error && filteredReports.length === 0 && (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-[var(--foreground-secondary)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">
                {searchQuery || filterStatus ? "Sin resultados" : "Historial vacío"}
              </p>
              <p className="text-[var(--foreground-secondary)] mt-1">
                {searchQuery || filterStatus
                  ? "Prueba con otros filtros"
                  : "Los reportes que generes aparecerán aquí"
                }
              </p>
            </div>
            {!searchQuery && !filterStatus && (
              <Link href="/generate-report">
                <Button variant="primary">Crear primer reporte</Button>
              </Link>
            )}
          </div>
        )}

        {!isLoading && !error && filteredReports.length > 0 && (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report) => (
                <ReportHistoryItem
                  key={report.id}
                  report={report}
                  onSelect={handleSelectReport}
                  onDelete={handleDeleteReport}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer con acción de limpiar */}
        {totalCount > 0 && !isLoading && (
          <div className="mt-8 pt-8 border-t border-[var(--surface-border)] dark:border-white/10 text-center">
            <Button
              variant="secondary"
              onClick={handleClearHistory}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpiar todo el historial
            </Button>
          </div>
        )}
      </main>

      <ConfirmDialog />
    </div>
  );
}
