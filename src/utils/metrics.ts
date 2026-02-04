// src/utils/metrics.ts
// Utilidades para calcular métricas de reportes

import type { SavedReport } from "./indexedDB";

/**
 * Rango de fechas para filtros
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Métricas agregadas de reportes
 */
export interface ReportMetrics {
  /** Total de reportes */
  totalReports: number;
  /** Total de tests ejecutados */
  totalTests: number;
  /** Tests exitosos */
  successfulTests: number;
  /** Tests fallidos */
  failedTests: number;
  /** Tasa de éxito (0-100) */
  successRate: number;
  /** Reportes por fecha (para gráficos) */
  reportsByDate: Array<{ date: string; count: number }>;
  /** Reportes por estado */
  reportsByStatus: Array<{ status: string; count: number; color: string }>;
  /** Tests por estado */
  testsByStatus: Array<{ status: string; count: number; color: string }>;
  /** Top testers */
  topTesters: Array<{ name: string; count: number }>;
  /** Reportes más recientes */
  recentReports: SavedReport[];
  /** Tendencia (comparado con período anterior) */
  trend: {
    reports: number; // Cambio porcentual
    successRate: number;
  };
}

/**
 * Rangos de fecha predefinidos
 */
export const DATE_RANGES = {
  today: (): DateRange => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  week: (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return { start, end };
  },
  month: (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    return { start, end };
  },
  quarter: (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    return { start, end };
  },
  year: (): DateRange => {
    const end = new Date();
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1);
    return { start, end };
  },
  all: (): DateRange => {
    return {
      start: new Date(0),
      end: new Date(),
    };
  },
};

/**
 * Colores para los estados
 */
const STATUS_COLORS: Record<string, string> = {
  exitoso: "#22c55e",
  fallido: "#ef4444",
  bloqueado: "#f59e0b",
  pendiente: "#6b7280",
  parcial: "#3b82f6",
};

/**
 * Calcula métricas a partir de una lista de reportes
 */
export function calculateMetrics(
  reports: SavedReport[],
  dateRange?: DateRange
): ReportMetrics {
  // Filtrar por rango de fechas si se especifica
  let filteredReports = reports;
  if (dateRange) {
    filteredReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= dateRange.start && reportDate <= dateRange.end;
    });
  }

  // Métricas básicas
  const totalReports = filteredReports.length;
  const totalTests = filteredReports.reduce((sum, r) => sum + r.metadata.totalTests, 0);
  const successfulTests = filteredReports.reduce((sum, r) => sum + r.metadata.successfulTests, 0);
  const failedTests = filteredReports.reduce((sum, r) => sum + r.metadata.failedTests, 0);
  const successRate = totalTests > 0 ? Math.round((successfulTests / totalTests) * 100) : 0;

  // Reportes por fecha
  const reportsByDate = calculateReportsByDate(filteredReports);

  // Reportes por estado
  const statusCounts = new Map<string, number>();
  filteredReports.forEach(report => {
    const status = report.metadata.testStatus.toLowerCase();
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
  });

  const reportsByStatus = Array.from(statusCounts.entries())
    .map(([status, count]) => ({
      status: capitalizeFirst(status),
      count,
      color: STATUS_COLORS[status] || "#6b7280",
    }))
    .sort((a, b) => b.count - a.count);

  // Tests por estado
  const testsByStatus = [
    { status: "Exitosos", count: successfulTests, color: STATUS_COLORS.exitoso },
    { status: "Fallidos", count: failedTests, color: STATUS_COLORS.fallido },
    { status: "Otros", count: Math.max(0, totalTests - successfulTests - failedTests), color: STATUS_COLORS.pendiente },
  ].filter(t => t.count > 0);

  // Top testers
  const testerCounts = new Map<string, number>();
  filteredReports.forEach(report => {
    const tester = report.metadata.tester || "Sin asignar";
    testerCounts.set(tester, (testerCounts.get(tester) || 0) + 1);
  });

  const topTesters = Array.from(testerCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Reportes recientes
  const recentReports = filteredReports
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Calcular tendencia
  const trend = calculateTrend(reports, dateRange);

  return {
    totalReports,
    totalTests,
    successfulTests,
    failedTests,
    successRate,
    reportsByDate,
    reportsByStatus,
    testsByStatus,
    topTesters,
    recentReports,
    trend,
  };
}

/**
 * Agrupa reportes por fecha
 */
function calculateReportsByDate(reports: SavedReport[]): Array<{ date: string; count: number }> {
  const dateMap = new Map<string, number>();

  reports.forEach(report => {
    const date = new Date(report.createdAt).toISOString().split("T")[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  // Convertir a array y ordenar por fecha
  return Array.from(dateMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-30); // Últimos 30 días
}

/**
 * Calcula la tendencia comparando con el período anterior
 */
function calculateTrend(
  reports: SavedReport[],
  dateRange?: DateRange
): { reports: number; successRate: number } {
  if (!dateRange) {
    return { reports: 0, successRate: 0 };
  }

  // Calcular duración del período
  const duration = dateRange.end.getTime() - dateRange.start.getTime();

  // Período anterior
  const prevStart = new Date(dateRange.start.getTime() - duration);
  const prevEnd = dateRange.start;

  // Filtrar período actual
  const currentReports = reports.filter(r => {
    const d = new Date(r.createdAt);
    return d >= dateRange.start && d <= dateRange.end;
  });

  // Filtrar período anterior
  const prevReports = reports.filter(r => {
    const d = new Date(r.createdAt);
    return d >= prevStart && d < prevEnd;
  });

  // Calcular cambio en reportes
  const currentCount = currentReports.length;
  const prevCount = prevReports.length;
  const reportsTrend = prevCount > 0
    ? Math.round(((currentCount - prevCount) / prevCount) * 100)
    : 0;

  // Calcular cambio en tasa de éxito
  const currentTests = currentReports.reduce((s, r) => s + r.metadata.totalTests, 0);
  const currentSuccess = currentReports.reduce((s, r) => s + r.metadata.successfulTests, 0);
  const currentRate = currentTests > 0 ? (currentSuccess / currentTests) * 100 : 0;

  const prevTests = prevReports.reduce((s, r) => s + r.metadata.totalTests, 0);
  const prevSuccess = prevReports.reduce((s, r) => s + r.metadata.successfulTests, 0);
  const prevRate = prevTests > 0 ? (prevSuccess / prevTests) * 100 : 0;

  const successRateTrend = prevRate > 0
    ? Math.round(currentRate - prevRate)
    : 0;

  return {
    reports: reportsTrend,
    successRate: successRateTrend,
  };
}

/**
 * Capitaliza la primera letra
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatea un número grande con sufijos (K, M, etc.)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

/**
 * Obtiene el nombre legible de un rango de fechas
 */
export function getRangeName(key: keyof typeof DATE_RANGES): string {
  const names: Record<string, string> = {
    today: "Hoy",
    week: "Última semana",
    month: "Último mes",
    quarter: "Último trimestre",
    year: "Último año",
    all: "Todo el tiempo",
  };
  return names[key] || key;
}
