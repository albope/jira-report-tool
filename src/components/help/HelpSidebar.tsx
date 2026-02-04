"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, BookOpen, FileText, HelpCircle, RotateCcw } from "lucide-react";
import { HelpContentItem, HelpProgress } from "@/types/help";

interface HelpSidebarProps {
  items: HelpContentItem[];
  progress: HelpProgress;
  activeSection: string | null;
  onNavigate: (id: string) => void;
  onResetProgress?: () => void;
}

const sectionIcons = {
  'jira-guide': BookOpen,
  'report-guide': FileText,
  'faq': HelpCircle,
};

const sectionLabels = {
  'jira-guide': 'Crear JIRA',
  'report-guide': 'Reportes',
  'faq': 'FAQ',
};

export function HelpSidebar({
  items,
  progress,
  activeSection,
  onNavigate,
  onResetProgress,
}: HelpSidebarProps) {
  const completedCount = Object.values(progress).filter(p => p.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Group items by section
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {} as Record<string, HelpContentItem[]>);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="
        hidden lg:flex flex-col
        sticky top-24 h-fit max-h-[calc(100vh-8rem)]
        w-72 shrink-0
        bg-[var(--surface)]/80 backdrop-blur-xl
        border border-[var(--surface-border)] dark:border-white/[0.06]
        rounded-2xl
        shadow-lg dark:shadow-2xl
        overflow-hidden
      "
    >
      {/* Header */}
      <div className="p-5 border-b border-[var(--surface-border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-1">
          Tu Progreso
        </h3>
        <p className="text-xs text-[var(--foreground-tertiary)]">
          {completedCount} de {totalCount} secciones completadas
        </p>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-[var(--surface-hover)] dark:bg-white/[0.05] rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--success)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Progress percentage */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--primary)]">
            {Math.round(progressPercentage)}% completado
          </span>
          {completedCount > 0 && onResetProgress && (
            <button
              onClick={onResetProgress}
              className="
                text-xs text-[var(--foreground-tertiary)]
                hover:text-[var(--foreground)]
                flex items-center gap-1
                transition-colors
              "
              title="Reiniciar progreso"
            >
              <RotateCcw size={12} />
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-4">
        {Object.entries(groupedItems).map(([section, sectionItems]) => {
          const Icon = sectionIcons[section as keyof typeof sectionIcons] || Circle;
          const label = sectionLabels[section as keyof typeof sectionLabels] || section;

          return (
            <div key={section}>
              {/* Section header */}
              <div className="flex items-center gap-2 px-2 mb-2">
                <Icon size={14} className="text-[var(--primary)]" />
                <span className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">
                  {label}
                </span>
              </div>

              {/* Section items */}
              <div className="space-y-1">
                {sectionItems.map((item) => {
                  const isActive = activeSection === item.id;
                  const isCompleted = progress[item.id]?.completed;

                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full text-left px-3 py-2.5 rounded-xl text-sm
                        transition-all duration-200
                        flex items-center gap-2.5
                        ${isActive
                          ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium border border-[var(--primary)]/20'
                          : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] dark:hover:bg-white/[0.05]'
                        }
                      `}
                    >
                      {/* Completion indicator */}
                      <span className="shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-[var(--success)]" />
                        ) : (
                          <Circle
                            size={16}
                            className={isActive ? "text-[var(--primary)]" : "text-[var(--foreground-tertiary)]"}
                          />
                        )}
                      </span>

                      {/* Title */}
                      <span className="truncate flex-1">
                        {item.stepNumber && `${item.stepNumber}. `}
                        {item.title}
                      </span>

                      {/* Estimated time */}
                      {item.estimatedTime && (
                        <span className="text-[10px] text-[var(--foreground-tertiary)] shrink-0">
                          {item.estimatedTime}min
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="p-4 border-t border-[var(--surface-border)] bg-[var(--surface-hover)]/50">
        <p className="text-[10px] text-[var(--foreground-tertiary)] text-center">
          Pulsa <kbd className="px-1.5 py-0.5 bg-[var(--surface)] border border-[var(--surface-border)] rounded text-[10px] mx-0.5">?</kbd> para atajos de teclado
        </p>
      </div>
    </motion.aside>
  );
}
