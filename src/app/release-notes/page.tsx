// app/release-notes/page.tsx
"use client";

import React, { useState } from "react";
import HeaderNav from "@/components/HeaderNav";

/** Estructura de cada versión en el Release Notes */
interface ReleaseItem {
  version: string;
  date: string;
  changes: string[];
}

/** Array con todas las versiones, de más reciente a más antigua */
const ALL_RELEASES: ReleaseItem[] = [
  {
    version: "1.2.2",
    date: "9 Abril 2025",
    changes: [
      "Se implementa la posibilidad de eliminar versiones individualmente (aspa roja) en la sección 'Versiones'.",
      "Se incluye toggle para 'Validación de una APP' y nueva BD 'MongoDB' en el formulario de Paso 2.",
    ],
  },
  {
    version: "1.2.1",
    date: "8 Abril 2025",
    changes: [
      "Se añade un enlace discreto para descargar la plantilla de Excel desde la sección de Batería de Pruebas, garantizando así el formato correcto de columnas.",
    ],
  },
  {
    version: "1.2.0",
    date: "4 Abril 2025",
    changes: [
      "Se añade la funcionalidad de importar Fichero Excel para añadir casos de prueba ya creados en un fichero Excel.",
      "Se incluye la columna Descripción en la Batería de Pruebas, reflejada en el reporte Markdown y en la exportación a Word.",
      "Ajustes menores de validación y supresión de advertencias sobre referencias en React.",
    ],
  },
  {
    version: "1.1.0",
    date: "27 Marzo 2025",
    changes: [
      "Se añade la nueva sección Datos de Prueba tras la Batería de Pruebas.",
      "La sección “Datos de Prueba” se incluye automáticamente en el reporte Markdown y en la exportación a Word.",
      "Validación lógica: Pruebas Exitosas/Fallidas no pueden superar el Total de Pruebas.",
      "Refactor del componente de paso 2 para validación inteligente y mayor control de cambios.",
    ],
  },
  {
    version: "1.0.0",
    date: "13 Marzo 2025",
    changes: [
      "Primera versión inicial del Generador de Reportes JIRA.",
      "Se añade el formulario de pasos (Paso 1, Paso 2 y Paso 3) con capacidad de generar reportes en Markdown y exportar a Word.",
      "Botón flotante de Feedback + Bugs para incidencias y sugerencias.",
      "Se incluye la sección de Ayuda con instrucciones detalladas y esta página de Release Notes.",
    ],
  },
];

/** Mostramos 5 versiones por página */
const ITEMS_PER_PAGE = 5;

export default function ReleaseNotesPage() {
  const [page, setPage] = useState(1);

  // Calculamos qué items mostrar en la página actual
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReleases = ALL_RELEASES.slice(startIndex, endIndex);

  // Para saber si hay más páginas
  const totalPages = Math.ceil(ALL_RELEASES.length / ITEMS_PER_PAGE);

  return (
    <>
      <HeaderNav />
      <main className="pt-20 p-8 min-h-screen bg-gray-50">
        <div
          className="
            max-w-3xl mx-auto
            bg-gradient-to-br from-white via-blue-50 to-white
            shadow-lg
            rounded-lg
            p-8
            space-y-6
            relative
            z-10
          "
        >
          <h1 className="text-3xl font-bold text-gray-800">
            Generador de Reportes JIRA — Release Notes
          </h1>

          {currentReleases.map((release) => (
            <section key={release.version} className="space-y-3">
              <p className="text-gray-500">
                Última actualización: {release.date}
              </p>
              <h2 className="text-2xl font-semibold text-gray-800">
                Versión {release.version}
              </h2>
              <ul className="list-disc list-inside text-gray-600 leading-relaxed">
                {release.changes.map((change, idx) => (
                  <li key={idx}>{change}</li>
                ))}
              </ul>
            </section>
          ))}

          {/* Paginación simple */}
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page === 1}
              className="
                px-4 py-1
                bg-blue-600 text-white
                rounded hover:bg-blue-500 transition
                disabled:bg-gray-300 disabled:cursor-not-allowed
              "
            >
              Anterior
            </button>
            <span className="text-gray-700">
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              className="
                px-4 py-1
                bg-blue-600 text-white
                rounded hover:bg-blue-500 transition
                disabled:bg-gray-300 disabled:cursor-not-allowed
              "
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>
    </>
  );
}