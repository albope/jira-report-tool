// src/app/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Users,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MetricCard, DonutChart, BarChart, LineChart } from "@/components/dashboard";
import { useReportHistoryAPI as useReportHistory } from "@/hooks/useReportHistoryAPI";
import { calculateMetrics, DATE_RANGES, getRangeName } from "@/utils/metrics";
import type { ReportMetrics } from "@/utils/metrics";

type DateRangeKey = keyof typeof DATE_RANGES;

export default function DashboardPage() {
  const { reports, isLoading } = useReportHistory(500);
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("month");
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null);

  // Calcular métricas cuando cambian los reportes o el rango
  useEffect(() => {
    if (reports.length > 0) {
      const range = DATE_RANGES[selectedRange]();
      const calculated = calculateMetrics(reports, range);
      setMetrics(calculated);
    } else {
      setMetrics(null);
    }
  }, [reports, selectedRange]);

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    if (!metrics) return null;

    return {
      statusDonut: metrics.reportsByStatus.map(s => ({
        label: s.status,
        value: s.count,
        color: s.color,
      })),
      testsDonut: metrics.testsByStatus.map(s => ({
        label: s.status,
        value: s.count,
        color: s.color,
      })),
      dailyBar: metrics.reportsByDate.slice(-7).map(d => ({
        label: new Date(d.date).toLocaleDateString("es-ES", { weekday: "short" }),
        value: d.count,
      })),
      dailyLine: metrics.reportsByDate,
    };
  }, [metrics]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--surface-border)] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[var(--foreground)]">
                    Dashboard
                  </h1>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    Métricas de tus reportes de prueba
                  </p>
                </div>
              </div>
            </div>

            {/* Selector de rango */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--foreground-secondary)]" />
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value as DateRangeKey)}
                className="px-3 py-2 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--surface)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50"
              >
                <option value="today">Hoy</option>
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="year">Último año</option>
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Loading */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center gap-4">
            <Activity className="w-10 h-10 text-[var(--primary)] animate-pulse" />
            <p className="text-[var(--foreground-secondary)]">Calculando métricas...</p>
          </div>
        )}

        {/* Sin datos */}
        {!isLoading && !metrics && (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-hover)] flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-[var(--foreground-secondary)]" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium text-[var(--foreground)]">
                Sin datos para mostrar
              </p>
              <p className="text-[var(--foreground-secondary)] mt-1">
                Genera algunos reportes para ver métricas
              </p>
            </div>
            <Link href="/generate-report">
              <Button variant="primary">Crear primer reporte</Button>
            </Link>
          </div>
        )}

        {/* Dashboard con datos */}
        {!isLoading && metrics && chartData && (
          <div className="space-y-8">
            {/* Métricas principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Reportes"
                value={metrics.totalReports}
                icon={FileText}
                iconColor="text-blue-500"
                iconBg="bg-blue-500/10"
                trend={metrics.trend.reports}
                trendLabel="vs período anterior"
              />
              <MetricCard
                title="Tests Ejecutados"
                value={metrics.totalTests}
                icon={Activity}
                iconColor="text-purple-500"
                iconBg="bg-purple-500/10"
              />
              <MetricCard
                title="Tasa de Éxito"
                value={metrics.successRate}
                suffix="%"
                icon={TrendingUp}
                iconColor="text-green-500"
                iconBg="bg-green-500/10"
                trend={metrics.trend.successRate}
                trendLabel="puntos vs anterior"
              />
              <MetricCard
                title="Tests Fallidos"
                value={metrics.failedTests}
                icon={XCircle}
                iconColor="text-red-500"
                iconBg="bg-red-500/10"
                description={`de ${metrics.totalTests} totales`}
              />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut de estados */}
              <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Reportes por Estado
                </h3>
                {chartData.statusDonut.length > 0 ? (
                  <DonutChart
                    data={chartData.statusDonut}
                    centerValue={`${metrics.totalReports}`}
                    centerLabel="reportes"
                  />
                ) : (
                  <p className="text-[var(--foreground-secondary)] text-center py-8">
                    Sin datos
                  </p>
                )}
              </div>

              {/* Donut de tests */}
              <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Tests por Resultado
                </h3>
                {chartData.testsDonut.length > 0 ? (
                  <DonutChart
                    data={chartData.testsDonut}
                    centerValue={`${metrics.successRate}%`}
                    centerLabel="éxito"
                  />
                ) : (
                  <p className="text-[var(--foreground-secondary)] text-center py-8">
                    Sin datos
                  </p>
                )}
              </div>
            </div>

            {/* Gráfico de actividad */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                Actividad Reciente
              </h3>
              {chartData.dailyLine.length > 1 ? (
                <div className="h-40">
                  <LineChart
                    data={chartData.dailyLine.map(d => ({
                      label: d.date,
                      value: d.count,
                    }))}
                    height={160}
                    color="#3b82f6"
                    showArea
                    showPoints
                  />
                </div>
              ) : (
                <p className="text-[var(--foreground-secondary)] text-center py-8">
                  Necesitas más datos para ver tendencias
                </p>
              )}
            </div>

            {/* Top testers y últimos reportes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top testers */}
              <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">
                    Top Testers
                  </h3>
                </div>
                {metrics.topTesters.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.topTesters.map((tester, index) => (
                      <div key={tester.name} className="flex items-center gap-3">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="flex-1 text-[var(--foreground)]">{tester.name}</span>
                        <span className="text-[var(--foreground-secondary)]">
                          {tester.count} reporte{tester.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--foreground-secondary)] text-center py-4">
                    Sin datos
                  </p>
                )}
              </div>

              {/* Reportes recientes */}
              <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      Reportes Recientes
                    </h3>
                  </div>
                  <Link href="/history" className="text-sm text-[var(--primary)] hover:underline">
                    Ver todo
                  </Link>
                </div>
                {metrics.recentReports.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.recentReports.map((report) => (
                      <div key={report.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors">
                        <div className={`w-2 h-2 rounded-full ${
                          report.metadata.testStatus === "Exitoso" ? "bg-green-500" :
                          report.metadata.testStatus === "Fallido" ? "bg-red-500" :
                          "bg-amber-500"
                        }`} />
                        <span className="font-mono text-sm text-[var(--primary)]">
                          {report.jiraCode}
                        </span>
                        <span className="flex-1 text-sm text-[var(--foreground)] truncate">
                          {report.title}
                        </span>
                        <span className="text-xs text-[var(--foreground-secondary)]">
                          {new Date(report.createdAt).toLocaleDateString("es-ES")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--foreground-secondary)] text-center py-4">
                    Sin reportes recientes
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
