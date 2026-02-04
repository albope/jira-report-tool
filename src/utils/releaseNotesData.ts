import { ReleaseVersion, VersionStats, ChangeType, ChangeTypeStyles } from "@/types/releaseNotes";

// All release versions data
export const ALL_RELEASES: ReleaseVersion[] = [
  {
    version: "2.0.0",
    date: "2 Febrero 2026",
    isMajor: true,
    summary: "Rediseño visual premium completo - La mayor evolución de la herramienta",
    changes: [
      // === EXPERIENCIA VISUAL ===
      { text: "Rediseño visual completo de toda la aplicación con estética premium inspirada en las mejores herramientas del mercado.", type: "style" },
      { text: "Nueva paleta de colores con modo oscuro profesional y transiciones suaves entre temas.", type: "style" },
      { text: "Efectos visuales interactivos: fondos animados que responden al movimiento del cursor.", type: "style" },
      { text: "Animaciones fluidas en toda la interfaz: transiciones de página, hover effects y micro-interacciones.", type: "style" },

      // === PÁGINA DE INICIO ===
      { text: "Landing page renovada con gradientes animados y efectos de iluminación dinámica.", type: "feat" },
      { text: "Botones de acción rediseñados con efectos de brillo y retroalimentación visual mejorada.", type: "style" },

      // === RELEASE NOTES ===
      { text: "Nueva sección de Release Notes completamente rediseñada con timeline visual interactivo.", type: "feat" },
      { text: "Dashboard de estadísticas: visualiza de un vistazo el total de versiones, features, mejoras y correcciones.", type: "feat" },
      { text: "Navegación lateral para saltar rápidamente entre versiones (en escritorio).", type: "feat" },
      { text: "Buscador con filtros por tipo de cambio y resaltado de coincidencias.", type: "feat" },
      { text: "Versiones expandibles/colapsables para una navegación más limpia.", type: "impr" },
      { text: "Iconos y badges de colores para identificar fácilmente cada tipo de cambio.", type: "style" },

      // === CENTRO DE AYUDA ===
      { text: "Centro de Ayuda rediseñado con tarjetas de acceso rápido a las funcionalidades principales.", type: "feat" },
      { text: "Sistema de progreso de lectura: marca las secciones como completadas y visualiza tu avance.", type: "feat" },
      { text: "Buscador inteligente que encuentra respuestas en todas las secciones de ayuda.", type: "feat" },
      { text: "Preguntas frecuentes con secciones expandibles para encontrar respuestas rápidamente.", type: "impr" },
      { text: "Galería de imágenes con vista ampliada al hacer clic.", type: "impr" },

      // === DARK MODE ===
      { text: "Modo oscuro completo con detección automática de preferencias del sistema.", type: "feat" },
      { text: "Selector de tema en la cabecera para cambiar entre modo claro y oscuro.", type: "feat" },
      { text: "Los efectos visuales se adaptan automáticamente al tema seleccionado.", type: "impr" },

      // === FORMULARIOS ===
      { text: "Campos de formulario rediseñados con efectos de enfoque y mejor retroalimentación visual.", type: "style" },
      { text: "Tarjetas de sección con bordes sutiles y efectos de profundidad.", type: "style" },

      // === NAVEGACIÓN ===
      { text: "Cabecera con efecto de transparencia y desenfoque para una apariencia moderna.", type: "style" },
      { text: "Enlaces de navegación con indicadores animados.", type: "style" },

      // === ATAJOS DE TECLADO ===
      { text: "Nuevos atajos de teclado: Ctrl+K para buscar, Escape para cerrar, flechas para navegar.", type: "feat" },
      { text: "Modal de ayuda con todos los atajos disponibles (pulsa ? para verlo).", type: "feat" },

      // === RENDIMIENTO Y ACCESIBILIDAD ===
      { text: "Optimización del rendimiento en dispositivos móviles.", type: "impr" },
      { text: "Mejoras de accesibilidad con contraste verificado en ambos temas.", type: "fix" },
      { text: "Diseño responsive mejorado para una experiencia óptima en cualquier dispositivo.", type: "impr" },
    ],
  },
  {
    version: "1.6.0",
    date: "7 Mayo 2025",
    summary: "Integración automática con JIRA API",
    changes: [
      { text: "Se implementa la obtención automática del título de un JIRA existente a partir de su código, utilizando la API REST de JIRA en el Paso 1 del generador de reportes.", type: "feat" },
      { text: "Al obtener el título de JIRA vía API, el código del JIRA se propaga automáticamente al Paso 2 y se bloquea para edición, con opción de desbloqueo manual si es necesario.", type: "impr" },
    ],
  },
  {
    version: "1.5.0",
    date: "30 Abril 2025",
    summary: "Nueva funcionalidad para crear JIRAs desde cero",
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
    summary: "Soporte para imágenes y logs en casos de prueba",
    changes: [
      { text: "Se implementa la posibilidad de añadir imagenes en los casos de prueba.", type: "feat" },
      { text: "Se añade al formulario la sección de Logs relevantes para añadir trazas de errores.", type: "feat" },
      { text: "Rediseño del formulario aplicando mejoras de estetica y usabilidad.", type: "style" }
    ],
  },
  {
    version: "1.3.0",
    date: "15 Abril 2025",
    summary: "Campos personalizados del entorno",
    changes: [
      { text: "Se implementa en el formulario la opción para añadir, editar y eliminar campos personalizados, que se reflejarán en el reporte.", type: "feat" },
      { text: "Se modifica el formato del reporte para incluir los campos personalizados en el bloque de entorno.", type: "impr" }
    ],
  },
  {
    version: "1.2.2",
    date: "9 Abril 2025",
    summary: "Mejoras en versiones y batería de pruebas",
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
    summary: "Plantilla de Excel para importación",
    changes: [
      { text: "Se añade un enlace discreto para descargar la plantilla de Excel desde la sección de Batería de Pruebas, garantizando así el formato correcto de columnas.", type: "impr" }
    ],
  },
  {
    version: "1.2.0",
    date: "4 Abril 2025",
    summary: "Importación de Excel y columna de descripción",
    changes: [
      { text: "Se añade la funcionalidad de importar Fichero Excel para añadir casos de prueba ya creados en un fichero Excel.", type: "feat" },
      { text: "Se incluye la columna Descripción en la Batería de Pruebas, reflejada en el reporte Markdown y en la exportación a Word.", type: "impr" },
      { text: "Ajustes menores de validación y supresión de advertencias sobre referencias en React.", type: "fix" }
    ],
  },
  {
    version: "1.1.0",
    date: "27 Marzo 2025",
    summary: "Nueva sección de Datos de Prueba",
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
    summary: "Lanzamiento inicial del Generador de Reportes JIRA",
    changes: [
      { text: "Primera versión inicial del Generador de Reportes JIRA.", type: "feat" },
      { text: "Se añade el formulario de pasos (Paso 1, Paso 2 y Paso 3) con capacidad de generar reportes en Markdown y exportar a Word.", type: "feat" },
      { text: "Botón flotante de Feedback + Bugs para incidencias y sugerencias.", type: "feat" },
      { text: "Se incluye la sección de Ayuda con instrucciones detalladas y esta página de Release Notes.", type: "feat" }
    ],
  },
];

// Change type styles configuration
export const changeTypeStyles: ChangeTypeStyles = {
  feat: {
    label: "Nuevo",
    icon: "Sparkles",
    bg: "bg-[var(--success-soft)]",
    text: "text-[var(--success)]",
    darkBg: "dark:bg-[var(--success)]/10"
  },
  impr: {
    label: "Mejora",
    icon: "TrendingUp",
    bg: "bg-[var(--primary-soft)]",
    text: "text-[var(--primary)]",
    darkBg: "dark:bg-[var(--primary)]/10"
  },
  fix: {
    label: "Corrección",
    icon: "Bug",
    bg: "bg-[var(--warning-soft)]",
    text: "text-[var(--warning)]",
    darkBg: "dark:bg-[var(--warning)]/10"
  },
  style: {
    label: "Estilo/UX",
    icon: "Palette",
    bg: "bg-purple-100 dark:bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    darkBg: ""
  },
};

// Get stats for a single version
export function getVersionStats(version: ReleaseVersion): VersionStats {
  const stats: VersionStats = {
    features: 0,
    improvements: 0,
    fixes: 0,
    styles: 0,
    total: version.changes.length,
  };

  version.changes.forEach((change) => {
    switch (change.type) {
      case "feat":
        stats.features++;
        break;
      case "impr":
        stats.improvements++;
        break;
      case "fix":
        stats.fixes++;
        break;
      case "style":
        stats.styles++;
        break;
    }
  });

  return stats;
}

// Get global stats for all releases
export function getGlobalStats(): VersionStats & { totalVersions: number } {
  const stats = {
    features: 0,
    improvements: 0,
    fixes: 0,
    styles: 0,
    total: 0,
    totalVersions: ALL_RELEASES.length,
  };

  ALL_RELEASES.forEach((release) => {
    const versionStats = getVersionStats(release);
    stats.features += versionStats.features;
    stats.improvements += versionStats.improvements;
    stats.fixes += versionStats.fixes;
    stats.styles += versionStats.styles;
    stats.total += versionStats.total;
  });

  return stats;
}

// Get all version numbers
export function getAllVersions(): string[] {
  return ALL_RELEASES.map((release) => release.version);
}

// Get latest version
export function getLatestVersion(): ReleaseVersion {
  return ALL_RELEASES[0];
}

// Find version by version string
export function findVersion(version: string): ReleaseVersion | undefined {
  return ALL_RELEASES.find((r) => r.version === version);
}

// Filter releases by change type
export function filterByChangeType(type: ChangeType | "all"): ReleaseVersion[] {
  if (type === "all") return ALL_RELEASES;
  return ALL_RELEASES.filter((release) =>
    release.changes.some((change) => change.type === type)
  );
}

// Search releases by query
export function searchReleases(query: string): ReleaseVersion[] {
  if (!query.trim()) return ALL_RELEASES;

  const lowerQuery = query.toLowerCase().trim();

  return ALL_RELEASES.filter((release) => {
    // Match version number
    if (release.version.toLowerCase().includes(lowerQuery)) return true;

    // Match summary
    if (release.summary?.toLowerCase().includes(lowerQuery)) return true;

    // Match change text
    return release.changes.some((change) =>
      change.text.toLowerCase().includes(lowerQuery)
    );
  });
}

// Get highlighted text with search matches
export function highlightSearchMatch(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(regex, '<mark class="bg-[var(--warning)]/30 text-[var(--foreground)] rounded px-0.5">$1</mark>');
}
