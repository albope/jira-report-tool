// src/app/release-notes/page.tsx
"use client";

import React, { useState } from "react"; // Eliminado useEffect si no se usa aquí
import HeaderNav from "@/components/HeaderNav";

// ... (interfaces ChangeType, ChangeItem, ReleaseItem y constante ALL_RELEASES sin cambios)...
// Definimos los tipos de cambio posibles
type ChangeType = "feat" | "impr" | "fix" | "style";

interface ChangeItem {
  text: string;
  type: ChangeType;
}

/** Estructura de cada versión en el Release Notes */
interface ReleaseItem {
  version: string;
  date: string;
  changes: ChangeItem[];
  isMajor?: boolean; // Para destacar versiones mayores
}

/** Array con todas las versiones, de más reciente a más antigua */
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
    isMajor: false, // Mantengo tu cambio a false
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
      { text: "La sección “Datos de Prueba” se incluye automáticamente en el reporte Markdown y en la exportación a Word.", type: "impr" },
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

const changeTypeStyles: Record<ChangeType, { label: string;bgColor: string; textColor: string }> = {
  feat: { label: "Nuevo", bgColor: "bg-green-100", textColor: "text-green-700" },
  impr: { label: "Mejora", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  fix: { label: "Corrección", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  style: { label: "Estilo/UX", bgColor: "bg-purple-100", textColor: "text-purple-700" },
};

export default function ReleaseNotesPage() {
  const [page, setPage] = useState(1);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ChangeType | "all">("all");

  const filteredReleases = ALL_RELEASES.filter(release => {
    if (selectedTypeFilter === "all") {
      return true;
    }
    return release.changes.some(change => change.type === selectedTypeFilter);
  });

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentReleases = filteredReleases.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredReleases.length / ITEMS_PER_PAGE);

  React.useEffect(() => {
    setPage(1);
  }, [selectedTypeFilter]);

  return (
    <>
      <HeaderNav />
      <main className="pt-20 p-4 md:p-8 min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-white via-blue-50 to-white shadow-lg rounded-lg p-6 md:p-8 space-y-8 relative z-10">
          <h1 className="text-3xl font-bold text-gray-800 text-center md:text-left">
            Generador de Reportes JIRA — Release Notes
          </h1>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 pb-4 border-b border-gray-200">
            <button
              onClick={() => setSelectedTypeFilter("all")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTypeFilter === "all" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
            >
              Todos
            </button>
            {Object.entries(changeTypeStyles).map(([type, style]) => (
              <button
                key={type}
                onClick={() => setSelectedTypeFilter(type as ChangeType)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedTypeFilter === type ? `${style.bgColor} ${style.textColor} font-semibold ring-2 ring-offset-1 ${style.textColor.replace('text-', 'ring-')}` : `bg-gray-200 text-gray-700 hover:bg-gray-300`}`}
              >
                {style.label}
              </button>
            ))}
          </div>

          {currentReleases.length === 0 && (
            <p className="text-gray-600 text-center py-8">
              No hay notas de versión que coincidan con el filtro seleccionado.
            </p>
          )}

          {currentReleases.map((release) => { // 'index' eliminado de aquí
            const isHighlighted = release.isMajor || (filteredReleases.length > 0 && filteredReleases[0].version === release.version && page === 1 && startIndex === 0);
            return (
            <section
              key={release.version} // 'key' sigue siendo release.version
              className={`space-y-3 p-4 rounded-lg transition-all duration-300 ease-in-out ${isHighlighted ? 'bg-blue-50 border-2 border-blue-500 shadow-md' : 'border border-gray-200 hover:shadow-sm'}`}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <h2 className={`text-2xl font-semibold ${isHighlighted ? 'text-blue-700' : 'text-gray-800'}`}>
                  Versión {release.version}
                  {isHighlighted && release.isMajor && <span className="ml-2 text-xs uppercase font-bold tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full align-middle">Destacado</span>}
                  {isHighlighted && !release.isMajor && (filteredReleases.length > 0 && filteredReleases[0].version === release.version) && <span className="ml-2 text-xs uppercase font-bold tracking-wider bg-green-500 text-white px-2 py-0.5 rounded-full align-middle">Más Reciente</span>}
                </h2>
                <p className={`text-sm ${isHighlighted ? 'text-blue-600' : 'text-gray-500'} mt-1 sm:mt-0`}>
                  Última actualización: {release.date}
                </p>
              </div>
              <ul className="list-none pl-0 space-y-2">
                {release.changes
                  .filter(change => selectedTypeFilter === "all" || change.type === selectedTypeFilter)
                  .map((change, idx) => ( // 'idx' se usa para la key interna, está bien
                  <li key={idx} className="flex items-start text-gray-700 leading-relaxed">
                    <span
                      className={`mr-2 mt-1 px-1.5 py-0.5 text-xs font-semibold rounded-full ${changeTypeStyles[change.type].bgColor} ${changeTypeStyles[change.type].textColor}`}
                    >
                      {changeTypeStyles[change.type].label}
                    </span>
                    <span>{change.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                Anterior
              </button>
              <span className="text-gray-700">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}