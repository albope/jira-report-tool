// src/utils/indexedDB.ts
// Wrapper para IndexedDB - Historial de reportes

import type { FormData, HiddenFields } from "./formatReport";
import type { ParsedData } from "./parseJiraContent";

const DB_NAME = "jira-report-tool";
const DB_VERSION = 1;
const STORE_NAME = "reports";

/**
 * Estructura de un reporte guardado
 */
export interface SavedReport {
  /** ID único (generado automáticamente) */
  id: string;
  /** Código JIRA */
  jiraCode: string;
  /** Título del issue */
  title: string;
  /** Fecha de creación */
  createdAt: string;
  /** Fecha de última modificación */
  updatedAt: string;
  /** Datos del formulario */
  formData: FormData;
  /** Campos ocultos */
  hiddenFields: HiddenFields;
  /** Datos parseados del JIRA */
  parsedData: ParsedData;
  /** Contenido del reporte en formato JIRA */
  reportContent: string;
  /** Metadatos para búsqueda y filtrado */
  metadata: {
    testStatus: string;
    totalTests: number;
    successfulTests: number;
    failedTests: number;
    tester: string;
  };
  /** ID del comentario en JIRA (si fue publicado) */
  jiraCommentId?: string;
}

/**
 * Inicializa la base de datos IndexedDB
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB no disponible en servidor"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Error al abrir IndexedDB: " + request.error?.message));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear store de reportes
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });

        // Índices para búsqueda eficiente
        store.createIndex("jiraCode", "jiraCode", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
        store.createIndex("testStatus", "metadata.testStatus", { unique: false });
        store.createIndex("tester", "metadata.tester", { unique: false });
      }
    };
  });
}

/**
 * Genera un ID único para un reporte
 */
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `rpt_${timestamp}_${randomPart}`;
}

/**
 * Guarda un nuevo reporte o actualiza uno existente
 */
export async function saveReport(report: Omit<SavedReport, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<string> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const now = new Date().toISOString();
    const isUpdate = !!report.id;

    const reportToSave: SavedReport = {
      ...report,
      id: report.id || generateId(),
      createdAt: isUpdate ? (report as SavedReport).createdAt : now,
      updatedAt: now,
    } as SavedReport;

    const request = store.put(reportToSave);

    request.onsuccess = () => {
      resolve(reportToSave.id);
    };

    request.onerror = () => {
      reject(new Error("Error al guardar reporte: " + request.error?.message));
    };
  });
}

/**
 * Obtiene un reporte por ID
 */
export async function getReport(id: string): Promise<SavedReport | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(new Error("Error al obtener reporte: " + request.error?.message));
    };
  });
}

/**
 * Obtiene todos los reportes, ordenados por fecha de actualización
 */
export async function getAllReports(limit?: number): Promise<SavedReport[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("updatedAt");
    const request = index.openCursor(null, "prev"); // Orden descendente

    const reports: SavedReport[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;

      if (cursor && (!limit || reports.length < limit)) {
        reports.push(cursor.value);
        cursor.continue();
      } else {
        resolve(reports);
      }
    };

    request.onerror = () => {
      reject(new Error("Error al listar reportes: " + request.error?.message));
    };
  });
}

/**
 * Busca reportes por código JIRA
 */
export async function getReportsByJiraCode(jiraCode: string): Promise<SavedReport[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("jiraCode");
    const request = index.getAll(jiraCode);

    request.onsuccess = () => {
      // Ordenar por fecha de actualización descendente
      const reports = (request.result as SavedReport[]).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      resolve(reports);
    };

    request.onerror = () => {
      reject(new Error("Error al buscar reportes: " + request.error?.message));
    };
  });
}

/**
 * Busca reportes por texto (en jiraCode, título o tester)
 */
export async function searchReports(query: string): Promise<SavedReport[]> {
  const allReports = await getAllReports();
  const queryLower = query.toLowerCase();

  return allReports.filter(report =>
    report.jiraCode.toLowerCase().includes(queryLower) ||
    report.title.toLowerCase().includes(queryLower) ||
    report.metadata.tester.toLowerCase().includes(queryLower)
  );
}

/**
 * Elimina un reporte por ID
 */
export async function deleteReport(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Error al eliminar reporte: " + request.error?.message));
    };
  });
}

/**
 * Elimina todos los reportes
 */
export async function clearAllReports(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error("Error al limpiar reportes: " + request.error?.message));
    };
  });
}

/**
 * Cuenta el número total de reportes
 */
export async function countReports(): Promise<number> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error("Error al contar reportes: " + request.error?.message));
    };
  });
}

/**
 * Obtiene reportes en un rango de fechas
 */
export async function getReportsByDateRange(startDate: Date, endDate: Date): Promise<SavedReport[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("createdAt");

    const range = IDBKeyRange.bound(
      startDate.toISOString(),
      endDate.toISOString()
    );

    const request = index.getAll(range);

    request.onsuccess = () => {
      resolve(request.result as SavedReport[]);
    };

    request.onerror = () => {
      reject(new Error("Error al buscar por fecha: " + request.error?.message));
    };
  });
}

/**
 * Exporta todos los reportes como JSON
 */
export async function exportReportsAsJSON(): Promise<string> {
  const reports = await getAllReports();
  return JSON.stringify(reports, null, 2);
}

/**
 * Importa reportes desde JSON
 */
export async function importReportsFromJSON(jsonString: string): Promise<number> {
  const reports = JSON.parse(jsonString) as SavedReport[];
  let imported = 0;

  for (const report of reports) {
    try {
      // Generar nuevo ID para evitar conflictos
      const newReport = { ...report, id: generateId() };
      await saveReport(newReport);
      imported++;
    } catch {
      console.warn(`Error al importar reporte ${report.jiraCode}`);
    }
  }

  return imported;
}
