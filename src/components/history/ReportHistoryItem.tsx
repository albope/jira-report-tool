// src/components/history/ReportHistoryItem.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  MoreVertical,
} from "lucide-react";
import type { SavedReport } from "@/utils/indexedDB";

interface ReportHistoryItemProps {
  report: SavedReport;
  onSelect: (report: SavedReport) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
}

export const ReportHistoryItem: React.FC<ReportHistoryItemProps> = ({
  report,
  onSelect,
  onDelete,
  isSelected = false,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  // Formatear fecha relativa
  const formatRelativeDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  // Obtener icono y color de estado
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "exitoso":
        return { icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" };
      case "fallido":
        return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" };
      case "bloqueado":
        return { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" };
      default:
        return { icon: FileText, color: "text-gray-500", bg: "bg-gray-500/10" };
    }
  };

  const statusInfo = getStatusInfo(report.metadata.testStatus);
  const StatusIcon = statusInfo.icon;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(report.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative group p-4 rounded-xl cursor-pointer transition-all
        border-2
        ${isSelected
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-transparent hover:border-[var(--surface-border)] hover:bg-[var(--surface-hover)]"
        }
      `}
      onClick={() => onSelect(report)}
    >
      <div className="flex items-start gap-3">
        {/* Icono de estado */}
        <div className={`p-2 rounded-lg ${statusInfo.bg}`}>
          <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-semibold text-[var(--primary)]">
              {report.jiraCode}
            </span>
            {report.jiraCommentId && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-medium">
                Publicado
              </span>
            )}
          </div>

          {/* Título */}
          <p className="text-sm text-[var(--foreground)] truncate mb-2">
            {report.title}
          </p>

          {/* Metadatos */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--foreground-secondary)]">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {report.metadata.tester || "Sin tester"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatRelativeDate(report.updatedAt)}
            </span>
            <span>
              {report.metadata.totalTests} test{report.metadata.totalTests !== 1 ? "s" : ""}
              {report.metadata.failedTests > 0 && (
                <span className="text-red-500 ml-1">
                  ({report.metadata.failedTests} fallido{report.metadata.failedTests !== 1 ? "s" : ""})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Menú de acciones */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 z-20 w-40 py-1 bg-[var(--surface)] border border-[var(--surface-border)] rounded-lg shadow-xl"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(report);
                    setShowMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportHistoryItem;
