// src/app/shared/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  AlertCircle,
  Copy,
  CheckCircle2,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { parseSharedData, copyToClipboard, type SharedReportData } from "@/utils/shareReport";
import formatReport from "@/utils/formatReport";
import { PreviewContent } from "@/components/step-three";

function SharedReportContent() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState<SharedReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [reportContent, setReportContent] = useState("");

  // Parsear datos al cargar
  useEffect(() => {
    const data = searchParams.get("data");

    if (!data) {
      setError("No se encontraron datos en el link. El link puede estar incompleto.");
      return;
    }

    const result = parseSharedData(data);

    if (result.success && result.data) {
      setReportData(result.data);
      // Generar contenido del reporte
      const content = formatReport(result.data.pd, result.data.fd, result.data.hf, "jira");
      setReportContent(content);
    } else {
      setError(result.error || "Error al cargar el reporte");
    }
  }, [searchParams]);

  // Copiar al portapapeles
  const handleCopy = async () => {
    const success = await copyToClipboard(reportContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Estado: Error
  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">
            Error al cargar el reporte
          </h1>
          <p className="text-[var(--foreground-secondary)] mb-6">{error}</p>
          <Link href="/">
            <Button variant="primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Estado: Cargando
  if (!reportData) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--foreground-secondary)]">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  // Estado: Reporte cargado
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[var(--surface)]/80 backdrop-blur-xl border-b border-[var(--surface-border)] dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
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
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[var(--foreground)]">
                    Reporte Compartido
                  </h1>
                  <p className="text-sm text-[var(--foreground-secondary)]">
                    {reportData.jc}
                  </p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <Button
                variant={copied ? "primary" : "secondary"}
                size="sm"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Info del reporte */}
        <div className="mb-6 p-4 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--foreground-secondary)]">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Compartido: {formatDate(reportData.ts)}
            </span>
            {reportData.fd.tester && (
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Tester: {reportData.fd.tester}
              </span>
            )}
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${reportData.fd.testStatus === "Exitoso"
                ? "bg-green-500/10 text-green-500"
                : reportData.fd.testStatus === "Fallido"
                ? "bg-red-500/10 text-red-500"
                : "bg-amber-500/10 text-amber-500"
              }
            `}>
              {reportData.fd.testStatus}
            </span>
          </div>
        </div>

        {/* Preview del reporte */}
        <div className="rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--surface-border)] dark:border-white/10">
          {/* Barra de título */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--surface-border)] dark:border-white/5 bg-[var(--surface-hover)] dark:bg-white/[0.02]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <span className="ml-2 text-xs text-[var(--foreground-tertiary)] font-medium">
              JIRA Preview (Solo lectura)
            </span>
          </div>

          {/* Contenido */}
          <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
            <PreviewContent content={reportContent} format="jira" />
          </div>
        </div>

        {/* Nota de solo lectura */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--foreground-secondary)]">
            Este es un reporte compartido en modo de solo lectura.
          </p>
          <Link href="/generate-report" className="text-sm text-[var(--primary)] hover:underline mt-1 inline-block">
            Crear tu propio reporte
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function SharedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin mx-auto mb-4" />
            <p className="text-[var(--foreground-secondary)]">Cargando...</p>
          </div>
        </div>
      }
    >
      <SharedReportContent />
    </Suspense>
  );
}
