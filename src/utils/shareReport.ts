// src/utils/shareReport.ts
// Utilidades para compartir reportes mediante URLs

import LZString from "lz-string";
import type { FormData, HiddenFields } from "./formatReport";
import type { ParsedData } from "./parseJiraContent";

/**
 * Datos compartidos en el reporte
 */
export interface SharedReportData {
  /** Versión del formato de datos */
  v: number;
  /** Código JIRA */
  jc: string;
  /** Datos parseados */
  pd: ParsedData;
  /** Datos del formulario (comprimidos) */
  fd: FormData;
  /** Campos ocultos */
  hf: HiddenFields;
  /** Timestamp de creación */
  ts: string;
}

const CURRENT_VERSION = 1;
const MAX_URL_LENGTH = 8000; // Límite seguro para URLs

/**
 * Genera una URL compartible con los datos del reporte
 */
export function generateShareableLink(
  formData: FormData,
  hiddenFields: HiddenFields,
  parsedData: ParsedData
): { url: string; success: boolean; error?: string } {
  try {
    // Crear estructura de datos
    const shareData: SharedReportData = {
      v: CURRENT_VERSION,
      jc: formData.jiraCode,
      pd: parsedData,
      fd: formData,
      hf: hiddenFields,
      ts: new Date().toISOString(),
    };

    // Convertir a JSON y comprimir
    const jsonString = JSON.stringify(shareData);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    // Construir URL
    const baseUrl = typeof window !== "undefined"
      ? `${window.location.origin}/shared`
      : "/shared";

    const fullUrl = `${baseUrl}?data=${compressed}`;

    // Verificar longitud
    if (fullUrl.length > MAX_URL_LENGTH) {
      return {
        url: "",
        success: false,
        error: `El reporte es demasiado grande para compartir (${Math.round(fullUrl.length / 1000)}KB). Máximo permitido: ${MAX_URL_LENGTH / 1000}KB`,
      };
    }

    return {
      url: fullUrl,
      success: true,
    };
  } catch (error) {
    return {
      url: "",
      success: false,
      error: error instanceof Error ? error.message : "Error al generar el link",
    };
  }
}

/**
 * Parsea los datos de un link compartido
 */
export function parseSharedData(compressedData: string): {
  data: SharedReportData | null;
  success: boolean;
  error?: string;
} {
  try {
    // Descomprimir
    const jsonString = LZString.decompressFromEncodedURIComponent(compressedData);

    if (!jsonString) {
      return {
        data: null,
        success: false,
        error: "No se pudo descomprimir los datos. El link puede estar corrupto.",
      };
    }

    // Parsear JSON
    const data = JSON.parse(jsonString) as SharedReportData;

    // Validar versión
    if (!data.v || data.v > CURRENT_VERSION) {
      return {
        data: null,
        success: false,
        error: "Versión de datos no soportada. Actualiza la aplicación.",
      };
    }

    // Validar estructura básica
    if (!data.fd || !data.pd || !data.jc) {
      return {
        data: null,
        success: false,
        error: "Datos incompletos o inválidos.",
      };
    }

    return {
      data,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : "Error al parsear los datos compartidos",
    };
  }
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback para navegadores antiguos
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    return true;
  } catch {
    return false;
  }
}

/**
 * Calcula el tamaño estimado de los datos comprimidos
 */
export function estimateShareSize(
  formData: FormData,
  hiddenFields: HiddenFields,
  parsedData: ParsedData
): { size: number; isValid: boolean } {
  try {
    const shareData = {
      v: CURRENT_VERSION,
      jc: formData.jiraCode,
      pd: parsedData,
      fd: formData,
      hf: hiddenFields,
      ts: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(shareData);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);

    // Tamaño de la URL base + datos
    const estimatedUrlLength = 50 + compressed.length;

    return {
      size: estimatedUrlLength,
      isValid: estimatedUrlLength <= MAX_URL_LENGTH,
    };
  } catch {
    return {
      size: 0,
      isValid: false,
    };
  }
}

/**
 * Formatea el tamaño en bytes a formato legible
 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
