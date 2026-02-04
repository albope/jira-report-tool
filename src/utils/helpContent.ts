import { HelpContentItem, FAQItemData } from "@/types/help";

// Structured content for Help page - enables search and progress tracking
export const helpContentItems: HelpContentItem[] = [
  // === JIRA GUIDE SECTION ===
  {
    id: "jira-intro",
    section: "jira-guide",
    title: "Introducción",
    keywords: ["crear", "jira", "nuevo", "empezar", "inicio", "incidencia", "ticket"],
    estimatedTime: 1,
  },
  {
    id: "jira-step-1",
    section: "jira-guide",
    title: "Datos básicos",
    keywords: ["proyecto", "herramienta", "descripción", "título", "error", "nombre"],
    stepNumber: 1,
    estimatedTime: 2,
  },
  {
    id: "jira-step-2",
    section: "jira-guide",
    title: "Detalle del problema",
    keywords: ["descripción", "pasos", "reproducir", "resultado", "esperado", "real", "impacto", "crítico"],
    stepNumber: 2,
    estimatedTime: 3,
  },
  {
    id: "jira-step-3",
    section: "jira-guide",
    title: "Entorno de pruebas",
    keywords: ["servidor", "ip", "navegador", "base datos", "entorno", "desarrollo", "uat", "producción"],
    stepNumber: 3,
    estimatedTime: 2,
  },
  {
    id: "jira-step-4",
    section: "jira-guide",
    title: "Versiones y campos extra",
    keywords: ["versiones", "aplicativos", "componentes", "personalizado", "extra", "adicional"],
    stepNumber: 4,
    estimatedTime: 2,
  },
  {
    id: "jira-step-5",
    section: "jira-guide",
    title: "Finalizar",
    keywords: ["copiar", "reiniciar", "enviar", "finalizar", "guardar", "evidencias"],
    stepNumber: 5,
    estimatedTime: 1,
  },

  // === REPORT GUIDE SECTION ===
  {
    id: "report-intro",
    section: "report-guide",
    title: "Introducción",
    keywords: ["reporte", "pruebas", "existente", "comentario", "documentar"],
    estimatedTime: 1,
  },
  {
    id: "report-step-1",
    section: "report-guide",
    title: "Pegar contenido del JIRA",
    keywords: ["pegar", "contenido", "código", "título", "automático"],
    stepNumber: 1,
    estimatedTime: 2,
  },
  {
    id: "report-step-2",
    section: "report-guide",
    title: "Completar información de pruebas",
    keywords: ["fecha", "tester", "entorno", "versiones", "batería", "casos", "prueba"],
    stepNumber: 2,
    estimatedTime: 3,
  },
  {
    id: "report-step-3",
    section: "report-guide",
    title: "Generar y exportar",
    keywords: ["generar", "exportar", "word", "markdown", "copiar", "docx", "descargar"],
    stepNumber: 3,
    estimatedTime: 2,
  },

  // === FAQ SECTION ===
  {
    id: "faq-when-to-use",
    section: "faq",
    title: "¿Cuándo usar cada opción?",
    keywords: ["cuándo", "usar", "crear", "generar", "diferencia"],
    estimatedTime: 1,
  },
  {
    id: "faq-clear-report",
    section: "faq",
    title: "¿Cómo hacer un reporte claro?",
    keywords: ["claro", "completo", "pasos", "detallado", "mejor"],
    estimatedTime: 1,
  },
  {
    id: "faq-custom-fields",
    section: "faq",
    title: "¿Puedo personalizar campos?",
    keywords: ["personalizar", "campos", "entorno", "custom", "añadir"],
    estimatedTime: 1,
  },
  {
    id: "faq-title-error",
    section: "faq",
    title: "¿Qué hacer si falla el título automático?",
    keywords: ["error", "falla", "título", "automático", "manual"],
    estimatedTime: 1,
  },
];

// FAQ items data for search
export const faqItems: FAQItemData[] = [
  {
    id: "faq-when-to-use",
    question: "¿Cuándo debo usar Crear un JIRA y cuándo Generar un reporte?",
    keywords: ["cuándo", "usar", "crear", "generar", "diferencia", "opción"],
  },
  {
    id: "faq-clear-report",
    question: "¿Cómo puedo asegurarme de que mi reporte sea claro y completo?",
    keywords: ["claro", "completo", "reporte", "mejor", "calidad", "detallado"],
  },
  {
    id: "faq-custom-fields",
    question: "¿Puedo personalizar los campos del entorno en los reportes?",
    keywords: ["personalizar", "campos", "entorno", "custom", "añadir", "extra"],
  },
  {
    id: "faq-title-error",
    question: "¿Qué hago si la obtención automática del título del JIRA falla?",
    keywords: ["error", "falla", "título", "automático", "manual", "problema"],
  },
];

// Section labels for display
export const sectionLabels: Record<string, string> = {
  'jira-guide': 'Guía: Crear un JIRA',
  'report-guide': 'Guía: Reporte de Pruebas',
  'faq': 'Preguntas Frecuentes',
};

// Get total estimated reading time
export function getTotalEstimatedTime(): number {
  return helpContentItems.reduce((acc, item) => acc + (item.estimatedTime || 0), 0);
}

// Get items by section
export function getItemsBySection(section: string): HelpContentItem[] {
  return helpContentItems.filter(item => item.section === section);
}

// Search across all content
export function searchHelpContent(query: string): HelpContentItem[] {
  if (!query.trim()) return helpContentItems;

  const lowerQuery = query.toLowerCase().trim();
  const queryWords = lowerQuery.split(/\s+/);

  return helpContentItems.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords.some(kw =>
      kw.toLowerCase().includes(lowerQuery)
    );
    const allWordsMatch = queryWords.every(word =>
      item.title.toLowerCase().includes(word) ||
      item.keywords.some(kw => kw.toLowerCase().includes(word))
    );

    return titleMatch || keywordMatch || allWordsMatch;
  });
}
