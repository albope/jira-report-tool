/**
 * Tipos centralizados para el proyecto jira-report-tool
 * Importar desde: import { FormData, BatteryTest, ... } from "@/types";
 */

// ============================================================================
// DATOS DE JIRA PARSEADOS
// ============================================================================

export interface ParsedData {
  title: string;
  description: string;
}

// ============================================================================
// BATERÍA DE PRUEBAS
// ============================================================================

export interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  /** Imágenes en formato base64 */
  images?: string[];
}

// ============================================================================
// INCIDENCIAS
// ============================================================================

export interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

// ============================================================================
// RESUMEN DE RESULTADOS
// ============================================================================

export interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

// ============================================================================
// CAMPOS OCULTABLES DEL ENTORNO
// ============================================================================

export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

// ============================================================================
// DATOS DEL FORMULARIO PRINCIPAL
// ============================================================================

export interface FormData {
  // Información general
  jiraCode: string;
  date: string;
  tester: string;
  testStatus: string;

  // Versiones
  versions: Array<{ appName: string; appVersion: string }>;

  // Entorno (ocultables)
  serverPruebas: string;
  ipMaquina: string;
  navegador: string;
  baseDatos: string;
  maquetaUtilizada: string;
  ambiente: string;

  // Batería de pruebas
  batteryTests: BatteryTest[];

  // Resumen
  summary: Summary;

  // Incidencias
  incidences: Incidence[];
  hasIncidences: boolean;

  // Conclusiones y datos adicionales
  conclusion: string;
  datosDePrueba: string;
  logsRelevantes?: string;

  // Campos específicos para APP móvil
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;

  // Campos personalizados del entorno
  customEnvFields: Array<{ label: string; value: string }>;
}

// ============================================================================
// TIPOS DE ESTADO DE PRUEBA
// ============================================================================

export type TestStatus = "Exitoso" | "Fallido" | "Bloqueado" | "No Ejecutado";

// ============================================================================
// TIPOS DE IMPACTO DE INCIDENCIA
// ============================================================================

export type IncidenceImpact = "Alto" | "Medio" | "Bajo";

// ============================================================================
// TIPOS DE ESTADO DE INCIDENCIA
// ============================================================================

export type IncidenceStatus = "Abierta" | "En Progreso" | "Resuelta" | "Cerrada";

// ============================================================================
// VALORES POR DEFECTO
// ============================================================================

export const DEFAULT_BATTERY_TEST: BatteryTest = {
  id: "PR-001",
  description: "",
  steps: "",
  expectedResult: "",
  obtainedResult: "",
  testVersion: "",
  testStatus: "Exitoso",
  images: [],
};

export const DEFAULT_SUMMARY: Summary = {
  totalTests: "1",
  successfulTests: "0",
  failedTests: "0",
  observations: "",
};

export const DEFAULT_HIDDEN_FIELDS: HiddenFields = {
  serverPruebas: false,
  ipMaquina: false,
  navegador: false,
  baseDatos: false,
  maquetaUtilizada: false,
  ambiente: false,
};

export const DEFAULT_INCIDENCE: Incidence = {
  id: "",
  description: "",
  impact: "Medio",
  status: "Abierta",
};
