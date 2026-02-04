// src/utils/parseJiraReport.ts
// Parser para extraer datos de un comentario JIRA con formato de reporte de pruebas

import type { FormData } from "./formatReport";
import type { BatteryTest, Incidence } from "@/types";

/**
 * Resultado del parsing de un reporte
 */
export interface ParsedReport {
  /** Si se pudo parsear correctamente */
  success: boolean;
  /** Datos extraídos del formulario */
  formData: Partial<FormData>;
  /** Errores o advertencias durante el parsing */
  warnings: string[];
  /** Confianza del parsing (0-1) */
  confidence: number;
}

/**
 * Intenta extraer datos de un comentario JIRA con formato de reporte de pruebas.
 *
 * Este parser es tolerante a variaciones en el formato y extrae lo que pueda.
 */
export function parseJiraReport(commentBody: string): ParsedReport {
  const warnings: string[] = [];
  const formData: Partial<FormData> = {};
  let matchCount = 0;
  const totalFields = 10; // Campos principales esperados

  try {
    // Normalizar saltos de línea
    const content = commentBody.replace(/\r\n/g, "\n");

    // ===== INFORMACIÓN GENERAL =====

    // Código JIRA
    const jiraCodeMatch = content.match(/\*?Código(?:\s+JIRA)?:?\*?\s*\[?([A-Z]+-\d+)\]?/i);
    if (jiraCodeMatch) {
      formData.jiraCode = jiraCodeMatch[1];
      matchCount++;
    }

    // Fecha
    const dateMatch = content.match(/\*?Fecha(?:\s+de\s+Prueba)?:?\*?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/i);
    if (dateMatch) {
      formData.date = normalizeDate(dateMatch[1]);
      matchCount++;
    }

    // Tester
    const testerMatch = content.match(/\*?(?:Tester|Responsable|Ejecutado por):?\*?\s*(.+?)(?:\n|$)/i);
    if (testerMatch) {
      formData.tester = testerMatch[1].trim();
      matchCount++;
    }

    // Estado general
    const statusMatch = content.match(/\*?Estado(?:\s+General)?:?\*?\s*(Exitoso|Fallido|Bloqueado|Parcial|En Progreso)/i);
    if (statusMatch) {
      formData.testStatus = capitalizeFirst(statusMatch[1]);
      matchCount++;
    }

    // ===== ENTORNO =====

    // Servidor
    const serverMatch = content.match(/\*?Servidor(?:\s+de\s+Pruebas)?:?\*?\s*(.+?)(?:\n|$)/i);
    if (serverMatch) {
      formData.serverPruebas = serverMatch[1].trim();
    }

    // IP
    const ipMatch = content.match(/\*?IP(?:\s+Máquina)?:?\*?\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/i);
    if (ipMatch) {
      formData.ipMaquina = ipMatch[1];
    }

    // Navegador
    const browserMatch = content.match(/\*?Navegador:?\*?\s*(.+?)(?:\n|$)/i);
    if (browserMatch) {
      formData.navegador = browserMatch[1].trim();
    }

    // Base de datos
    const dbMatch = content.match(/\*?(?:Base\s+de\s+Datos|BD):?\*?\s*(.+?)(?:\n|$)/i);
    if (dbMatch) {
      formData.baseDatos = dbMatch[1].trim();
    }

    // Ambiente
    const envMatch = content.match(/\*?Ambiente:?\*?\s*(.+?)(?:\n|$)/i);
    if (envMatch) {
      formData.ambiente = envMatch[1].trim();
    }

    // ===== BATERÍA DE PRUEBAS =====

    const batteryTests = parseBatteryTests(content);
    if (batteryTests.length > 0) {
      formData.batteryTests = batteryTests;
      matchCount += 2; // Vale más porque es la parte principal
    } else {
      warnings.push("No se pudieron extraer casos de prueba");
    }

    // ===== RESUMEN =====

    const summaryMatch = content.match(/Total(?:\s+de\s+Pruebas)?:?\s*(\d+)/i);
    const successMatch = content.match(/(?:Exitosas?|Pasadas?):?\s*(\d+)/i);
    const failedMatch = content.match(/(?:Fallidas?|Fallaron):?\s*(\d+)/i);

    if (summaryMatch || successMatch || failedMatch) {
      formData.summary = {
        totalTests: summaryMatch?.[1] || String(batteryTests.length),
        successfulTests: successMatch?.[1] || "0",
        failedTests: failedMatch?.[1] || "0",
        observations: "",
      };
      matchCount++;
    }

    // ===== INCIDENCIAS =====

    const incidences = parseIncidences(content);
    if (incidences.length > 0) {
      formData.incidences = incidences;
      formData.hasIncidences = true;
    } else {
      formData.hasIncidences = false;
      formData.incidences = [];
    }

    // ===== CONCLUSIONES =====

    const conclusionMatch = content.match(/(?:Conclusi[oó]n(?:es)?|Observaciones\s+Finales):?\s*\n?([\s\S]*?)(?=\n\n|\n(?:h[123]\.|#)|$)/i);
    if (conclusionMatch) {
      formData.conclusion = conclusionMatch[1].trim();
      matchCount++;
    }

    // ===== DATOS DE PRUEBA =====

    const testDataMatch = content.match(/Datos\s+de\s+Prueba:?\s*\n?([\s\S]*?)(?=\n\n(?:h[123]\.|#|Evidencias|Logs)|$)/i);
    if (testDataMatch) {
      formData.datosDePrueba = testDataMatch[1].trim();
    }

    // ===== LOGS =====

    const logsMatch = content.match(/Logs?\s+Relevantes?:?\s*\n?(?:\{code\}|```)?([^]*?)(?:\{code\}|```)?(?=\n\n(?:h[123]\.|#)|$)/i);
    if (logsMatch) {
      formData.logsRelevantes = logsMatch[1].trim();
    }

    // Calcular confianza
    const confidence = Math.min(1, matchCount / totalFields);

    return {
      success: matchCount >= 3, // Al menos 3 campos principales
      formData,
      warnings,
      confidence,
    };
  } catch (error) {
    return {
      success: false,
      formData: {},
      warnings: [`Error durante el parsing: ${error instanceof Error ? error.message : "Error desconocido"}`],
      confidence: 0,
    };
  }
}

/**
 * Parsea la tabla de batería de pruebas
 */
function parseBatteryTests(content: string): BatteryTest[] {
  const tests: BatteryTest[] = [];

  // Intentar formato de tabla JIRA: || Header || Header ||
  const jiraTableMatch = content.match(/\|\|[^|]*ID[^|]*\|\|[\s\S]*?(?=\n\n|\n(?:h[123]\.|#)|$)/i);

  if (jiraTableMatch) {
    const tableContent = jiraTableMatch[0];
    const rows = tableContent.split("\n").filter(row => row.startsWith("|") && !row.startsWith("||"));

    for (const row of rows) {
      const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
      if (cells.length >= 4) {
        tests.push({
          id: cells[0] || `TC-${tests.length + 1}`,
          description: cells[1] || "",
          steps: cells[2] || "",
          expectedResult: cells[3] || "",
          obtainedResult: cells[4] || "",
          testVersion: cells[5] || "",
          testStatus: normalizeStatus(cells[6] || "Pendiente"),
          images: [],
        });
      }
    }
  }

  // Intentar formato markdown: | Header | Header |
  if (tests.length === 0) {
    const mdTableMatch = content.match(/\|[^|]*ID[^|]*\|[\s\S]*?(?=\n\n|\n(?:##|#)|$)/i);

    if (mdTableMatch) {
      const tableContent = mdTableMatch[0];
      const rows = tableContent.split("\n")
        .filter(row => row.includes("|") && !row.includes("---") && !row.includes("ID"));

      for (const row of rows) {
        const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
        if (cells.length >= 4) {
          tests.push({
            id: cells[0] || `TC-${tests.length + 1}`,
            description: cells[1] || "",
            steps: cells[2] || "",
            expectedResult: cells[3] || "",
            obtainedResult: cells[4] || "",
            testVersion: cells[5] || "",
            testStatus: normalizeStatus(cells[6] || "Pendiente"),
            images: [],
          });
        }
      }
    }
  }

  return tests;
}

/**
 * Parsea la tabla de incidencias
 */
function parseIncidences(content: string): Incidence[] {
  const incidences: Incidence[] = [];

  // Buscar sección de incidencias
  const incidenceSection = content.match(/(?:Incidencias|Issues|Defectos):?[\s\S]*?(?=\n\n(?:h[123]\.|#|Conclus)|$)/i);

  if (!incidenceSection) return incidences;

  const sectionContent = incidenceSection[0];

  // Buscar filas de tabla
  const rows = sectionContent.split("\n").filter(row =>
    row.includes("|") && !row.includes("||") && !row.includes("---") && !row.toLowerCase().includes("id")
  );

  for (const row of rows) {
    const cells = row.split("|").map(cell => cell.trim()).filter(Boolean);
    if (cells.length >= 2) {
      incidences.push({
        id: cells[0] || `INC-${incidences.length + 1}`,
        description: cells[1] || "",
        impact: cells[2] || "Medio",
        status: cells[3] || "Abierto",
      });
    }
  }

  return incidences;
}

/**
 * Normaliza una fecha a formato YYYY-MM-DD
 */
function normalizeDate(dateStr: string): string {
  // Intentar varios formatos
  const parts = dateStr.split(/[\/\-]/);

  if (parts.length !== 3) return dateStr;

  let year: string, month: string, day: string;

  if (parts[0].length === 4) {
    // YYYY-MM-DD
    [year, month, day] = parts;
  } else if (parts[2].length === 4) {
    // DD/MM/YYYY o MM/DD/YYYY
    // Asumimos DD/MM/YYYY (formato europeo/latinoamericano)
    [day, month, year] = parts;
  } else {
    // DD/MM/YY
    [day, month, year] = parts;
    year = `20${year}`;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Normaliza el estado de una prueba
 */
function normalizeStatus(status: string): string {
  const normalized = status.toLowerCase().trim();

  if (normalized.includes("exit") || normalized.includes("pass") || normalized.includes("ok")) {
    return "Exitoso";
  }
  if (normalized.includes("fall") || normalized.includes("fail") || normalized.includes("error")) {
    return "Fallido";
  }
  if (normalized.includes("bloq") || normalized.includes("block")) {
    return "Bloqueado";
  }
  if (normalized.includes("pend") || normalized.includes("skip")) {
    return "Pendiente";
  }

  return capitalizeFirst(status);
}

/**
 * Capitaliza la primera letra
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Verifica si un texto parece ser un reporte de pruebas
 */
export function isTestReport(content: string): boolean {
  const markers = [
    /REPORTE\s+DE\s+PRUEBAS/i,
    /h1\.\s*Información\s+General/i,
    /##?\s*Batería\s+de\s+Pruebas/i,
    /\|\|\s*ID\s*\|\|\s*Descripción/i,
    /📌\s*Información\s+General/i,
  ];

  return markers.some(marker => marker.test(content));
}
