// src/app/release-notes/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import { Sparkles, ChevronLeft, ChevronRight, Tag } from "lucide-react";

type ChangeType = "feat" | "impr" | "fix" | "style";

interface ChangeItem {
  text: string;
  type: ChangeType;
}

interface ReleaseItem {
  version: string;
  date: string;
  changes: ChangeItem[];
  isMajor?: boolean;
}

const ALL_RELEASES: ReleaseItem[] = [
  {
    version: "1.6.0",
    date: "7 Mayo 2025",
    changes: [
      { text: "Se implementa la obtención automática del título de un JIRA existente a partir de su código, utilizando la API REST de JIRA en el Paso 1 del generador de reportes.", type: "feat" },
      { text: "Al obtener el título de JIRA vía API, el código del JIRA se propaga automáticamente al Paso 2 y se bloquea para edición, con opción de desbloqueo manual si es necesario.", type: "impr" },
    ],
  },
  {
    version: "1.5.0",
    date: "30 Abril 2025",
    isMajor: false,
    changes: [
      { text: "Se añade la nueva funcionalidad 'Crear un nuevo JIRA' accesible desde la página de inicio y el menú de ayuda.", type: "feat" },
      { text: "El formulario de creación de JIRA permite definir proyecto, herramienta, descripción del error para generar un título estandarizado.", type: "feat" },
      { text: "Incluye campos detallados para descripción del problema, pasos para reproducir, resultado esperado/real, impacto, entorno de pruebas (con opción de ocultar campos), versiones de aplicativos, detalles específicos para APPs móviles/escritorio y campos personalizados.", type: "feat" },
      { text: "Permite adjuntar múltiples evidencias (imágenes) y visualizar/copiar el contenido formateado para JIRA.", type: "feat" }
    ],
  },
  {
    version: "1.4.0",
    date: "23 Abril 2025",
    changes: [
      { text: "Se implementa la posibilidad de añadir imagenes en los casos de prueba.", type: "feat" },
      { text: "Se añade al formulario la sección de Logs relevantes para añadir trazas de errores.", type: "feat" },
      { text: "Rediseño del formulario aplicando mejoras de estetica y usabilidad.", type: "style" }
    ],
  },
  {
    version: "1.3.0",
    date: "15 Abril 2025",
    changes: [
      { text: "Se implementa en el formulario la opción para añadir, editar y eliminar campos personalizados, que se reflejarán en el reporte.", type: "feat" },
      { text: "Se modifica el formato del reporte para incluir los campos personalizados en el bloque de entorno.", type: "impr" }
    ],
  },
  {
    version: "1.2.2",
    date: "9 Abril 2025",
    changes: [
      { text: "Se implementa la posibilidad de eliminar versiones individualmente (aspa roja) en la sección 'Versiones'.", type: "impr" },
      { text: "Se incluye toggle para 'Validación de una APP' y nueva BD 'MongoDB' en el formulario.", type: "feat" },
      { text: "Se añade la columna 'Versión' a la Batería de Pruebas (importación Excel con 7 columnas).", type: "impr" },
      { text: "Se añade el botón para duplicar un caso de prueba manual en la Batería de Pruebas, asignando un nuevo ID consecutivo.", type: "feat" },
      { text: "La tabla de 'Entorno de Pruebas' ahora se muestra como una lista legible en el Word exportado.", type: "impr" },
      { text: "Se respeta la lógica de campos ocultos: los campos desmarcados no se incluyen en el reporte.", type: "fix" },
      { text: "Se añade un salto de línea tras los títulos para mejorar la legibilidad en Word.", type: "impr" }
    ],
  },
  {
    version: "1.2.1",
    date: "8 Abril 2025",
    changes: [
      { text: "Se añade un enlace discreto para descargar la plantilla de Excel desde la sección de Batería de Pruebas, garantizando así el formato correcto de columnas.", type: "impr" }
    ],
  },
  {
    version: "1.2.0",
    date: "4 Abril 2025",
    changes: [
      { text: "Se añade la funcionalidad de importar Fichero Excel para añadir casos de prueba ya creados en un fichero Excel.", type: "feat" },
      { text: "Se incluye la columna Descripción en la Batería de Pruebas, reflejada en el reporte Markdown y en la exportación a Word.", type: "impr" },
      { text: "Ajustes menores de validación y supresión de advertencias sobre referencias en React.", type: "fix" }
    ],
  },
  {
    version: "1.1.0",
    date: "27 Marzo 2025",
    changes: [
      { text: "Se añade la nueva sección Datos de Prueba tras la Batería de Pruebas.", type: "feat" },
      { text: "La sección 'Datos de Prueba' se incluye automáticamente en el reporte Markdown y en la exportación a Word.", type: "impr" },
      { text: "Validación lógica: Pruebas Exitosas/Fallidas no pueden superar el Total de Pruebas.", type: "fix" },
      { text: "Refactor del componente de paso 2 para validación inteligente y mayor control de cambios.", type: "impr" }
    ],
  },
  {
    version: "1.0.0",
    date: "13 Marzo 2025",
    isMajor: true,
    changes: [
      { text: "Primera versión inicial del Generador de Reportes JIRA.", type: "feat" },
      { text: "Se añade el formulario de pasos (Paso 1, Paso 2 y Paso 3) con capacidad de generar reportes en Markdown y exportar a Word.", type: "feat" },
      { text: "Botón flotante de Feedback + Bugs para incidencias y sugerencias.", type: "feat" },
      { text: "Se incluye la sección de Ayuda con instrucciones detalladas y esta página de Release Notes.", type: "feat" }
    ],
  },
];

const ITEMS_PER_PAGE = 5;

const changeTypeStyles: Record<ChangeType, { label: string; bg: string; text: string; darkBg: string }> = {
  feat: { label: "Nuevo", bg: "bg-[var(--success-soft)]", text: "text-[var(--success)]", darkBg: "dark:bg-[var(--success)]/10" },
  impr: { label: "Mejora", bg: "bg-[var(--primary-soft)]", text: "text-[var(--primary)]", darkBg: "dark:bg-[var(--primary)]/10" },
  fix: { label: "Corrección", bg: "bg-[var(--warning-soft)]", text: "text-[var(--warning)]", darkBg: "dark:bg-[var(--warning)]/10" },
  style: { label: "Estilo/UX", bg: "bg-purple-100 dark:bg-purple-500/10", text: "text-purple-700 dark:text-purple-400", darkBg: "" },
};

export default function ReleaseNotesPage() {
  const [page, setPage] = useState(1);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ChangeType | "all">("all");

  const filteredReleases = ALL_RELEASES.filter(release => {
    if (selectedTypeFilter === "all") return true;
    return release.changes.some(change => change.type === selectedTypeFilter);
  });

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReleases = filteredReleases.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredReleases.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [selectedTypeFilter]);

  return (
    <>
      <HeaderNav />
      <main className="pt-24 pb-20 px-4 sm:px-6 min-h-screen bg-[var(--background)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
              className="
                mx-auto w-16 h-16 rounded-2xl
                bg-gradient-to-br from-[var(--primary)] to-purple-600
                flex items-center justify-center
                shadow-lg shadow-[var(--primary-glow)]
              "
            >
              <Tag className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--foreground)]">
              Release Notes
            </h1>
            <p className="text-[var(--foreground-secondary)]">
              Generador de Reportes JIRA — Historial de versiones
            </p>
          </div>

          {/* Filter Chips */}
          <div className="
            flex flex-wrap justify-center gap-2 p-4
            bg-[var(--surface)] dark:bg-[var(--surface)]/80
            border border-[var(--surface-border)] dark:border-white/[0.06]
            rounded-2xl shadow-lg
          ">
            <FilterChip
              label="Todos"
              active={selectedTypeFilter === "all"}
              onClick={() => setSelectedTypeFilter("all")}
            />
            {Object.entries(changeTypeStyles).map(([type, style]) => (
              <FilterChip
                key={type}
                label={style.label}
                active={selectedTypeFilter === type}
                onClick={() => setSelectedTypeFilter(type as ChangeType)}
                colorClass={style.text}
              />
            ))}
          </div>

          {/* Release List */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {currentReleases.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-[var(--foreground-tertiary)] py-12"
                >
                  No hay notas de versión que coincidan con el filtro seleccionado.
                </motion.p>
              ) : (
                currentReleases.map((release, index) => {
                  const isLatest = filteredReleases[0]?.version === release.version && page === 1;
                  const isHighlighted = release.isMajor || isLatest;

                  return (
                    <motion.section
                      key={release.version}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`
                        p-6 rounded-2xl
                        bg-[var(--surface)] dark:bg-[var(--surface)]/80
                        border
                        ${isHighlighted
                          ? "border-[var(--primary)]/50 shadow-lg shadow-[var(--primary-glow)]"
                          : "border-[var(--surface-border)] dark:border-white/[0.06]"
                        }
                        transition-all duration-300
                        hover:shadow-lg
                      `}
                    >
                      {/* Version Header */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <div className="flex items-center gap-3">
                          <h2 className={`text-xl font-bold ${isHighlighted ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>
                            Versión {release.version}
                          </h2>
                          {release.isMajor && (
                            <span className="
                              px-2 py-0.5 text-xs font-semibold uppercase
                              bg-[var(--primary)] text-white rounded-full
                              flex items-center gap-1
                            ">
                              <Sparkles size={12} /> Destacado
                            </span>
                          )}
                          {isLatest && !release.isMajor && (
                            <span className="
                              px-2 py-0.5 text-xs font-semibold uppercase
                              bg-[var(--success)] text-white rounded-full
                            ">
                              Más Reciente
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--foreground-tertiary)]">
                          {release.date}
                        </p>
                      </div>

                      {/* Changes List */}
                      <ul className="space-y-3">
                        {release.changes
                          .filter(change => selectedTypeFilter === "all" || change.type === selectedTypeFilter)
                          .map((change, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <span className={`
                                mt-0.5 px-2 py-0.5 text-xs font-semibold rounded-full
                                ${changeTypeStyles[change.type].bg}
                                ${changeTypeStyles[change.type].darkBg}
                                ${changeTypeStyles[change.type].text}
                              `}>
                                {changeTypeStyles[change.type].label}
                              </span>
                              <span className="text-sm text-[var(--foreground-secondary)] leading-relaxed">
                                {change.text}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </motion.section>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="
              flex justify-center items-center gap-4 pt-6
              border-t border-[var(--surface-border)]
            ">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  bg-[var(--primary)] text-white rounded-xl
                  font-medium text-sm
                  hover:bg-[var(--primary-hover)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
              <span className="text-sm text-[var(--foreground-secondary)]">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="
                  inline-flex items-center gap-2 px-4 py-2
                  bg-[var(--primary)] text-white rounded-xl
                  font-medium text-sm
                  hover:bg-[var(--primary-hover)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </main>
      <FooterNav />
    </>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  colorClass,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  colorClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 text-sm font-medium rounded-xl
        transition-all duration-200
        ${active
          ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary-glow)]"
          : `
            bg-[var(--surface-hover)] dark:bg-white/[0.05]
            ${colorClass || "text-[var(--foreground-secondary)]"}
            hover:bg-[var(--surface-active)] dark:hover:bg-white/[0.08]
            border border-[var(--surface-border)] dark:border-white/[0.06]
          `
        }
      `}
    >
      {label}
    </button>
  );
}
