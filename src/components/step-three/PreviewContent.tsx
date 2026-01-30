"use client";

import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { AlertCircle, FileImage, Code, Eye } from "lucide-react";
import type { PreviewFormat } from "./types";

interface PreviewContentProps {
  content: string;
  format: PreviewFormat;
  className?: string;
}

/**
 * Componente que renderiza el contenido del preview según el formato seleccionado.
 */
export function PreviewContent({
  content,
  format,
  className = "",
}: PreviewContentProps) {
  // Componentes personalizados para ReactMarkdown
  const markdownComponents = {
    img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
      const altText = alt || "";
      if (!src) {
        return (
          <span className="flex items-center text-xs italic text-[var(--foreground-tertiary)] my-2 p-2 bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-md">
            <AlertCircle size={14} className="mr-2 text-[var(--warning)] flex-shrink-0" />
            Referencia de imagen inválida: ({altText || "Sin descripción"})
          </span>
        );
      }
      if (src.startsWith("data:image")) {
        return (
          <span className="flex items-center text-xs italic text-[var(--foreground-tertiary)] my-2 p-2 bg-[var(--surface-hover)] border border-[var(--surface-border)] rounded-md">
            <FileImage size={14} className="mr-2 text-[var(--foreground-secondary)] flex-shrink-0" />
            {altText || "Imagen adjunta (ver en Word)"}
          </span>
        );
      }
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={src} alt={altText} className="max-w-sm h-auto rounded-md shadow-sm my-2" {...props} />;
    },
    table: (props: React.TableHTMLAttributes<HTMLTableElement>) => (
      <div className="overflow-x-auto my-4 rounded-lg border border-[var(--surface-border)]">
        <table className="min-w-full divide-y divide-[var(--surface-border)]" {...props} />
      </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <thead className="bg-[var(--surface-hover)]" {...props} />
    ),
    th: (props: React.ThHTMLAttributes<HTMLTableCellElement>) => (
      <th
        scope="col"
        className="px-4 py-2.5 text-left text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider"
        {...props}
      />
    ),
    td: (props: React.TdHTMLAttributes<HTMLTableCellElement>) => (
      <td className="px-4 py-3 whitespace-pre-wrap text-sm text-[var(--foreground)]" {...props} />
    ),
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className="my-2 leading-relaxed text-[var(--foreground)]" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
      <ul className="list-disc pl-5 my-2 space-y-1" {...props} />
    ),
    ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
      <ol className="list-decimal pl-5 my-2 space-y-1" {...props} />
    ),
    li: (props: React.LiHTMLAttributes<HTMLLIElement>) => (
      <li className="text-[var(--foreground)]" {...props} />
    ),
    code: ({ className: codeClassName, children, ...props }: React.HTMLAttributes<HTMLElement>) => {
      const isInline = !codeClassName;
      if (isInline) {
        return (
          <code
            className="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--primary)] text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code
          className={`block p-4 rounded-lg bg-[#1a1a2e] text-gray-100 text-sm font-mono overflow-x-auto ${codeClassName}`}
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre className="my-4 rounded-lg overflow-hidden" {...props} />
    ),
  };

  // Renderizado según el formato
  if (format === "jira") {
    return (
      <motion.div
        key="jira"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`prose prose-sm sm:prose-base max-w-none ${className}`}
      >
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </motion.div>
    );
  }

  if (format === "word") {
    return (
      <motion.div
        key="word"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        {/* Simula un documento Word con estilo de página */}
        <div
          className="
            bg-white dark:bg-gray-100 shadow-xl rounded-sm mx-auto
            p-8 sm:p-12 max-w-[21cm] min-h-[29.7cm]
            border border-[var(--surface-border)]
          "
          style={{ fontFamily: "Times New Roman, serif" }}
        >
          <div className="prose prose-sm max-w-none text-gray-900">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    );
  }

  if (format === "html") {
    return (
      <motion.div
        key="html"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        <div className="flex items-center gap-2 mb-4 text-[var(--foreground-secondary)]">
          <Code className="w-4 h-4" />
          <span className="text-sm font-medium">Código HTML</span>
        </div>
        <div
          className="
            p-4 rounded-xl
            bg-[#1a1a2e] text-gray-100
            font-mono text-sm
            overflow-x-auto max-h-[60vh]
            border border-[var(--surface-border)]
          "
        >
          <pre className="whitespace-pre-wrap break-words">
            {generateHtmlPreview(content)}
          </pre>
        </div>
      </motion.div>
    );
  }

  if (format === "pdf") {
    return (
      <motion.div
        key="pdf"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={className}
      >
        {/* Simula una página PDF */}
        <div className="flex items-center gap-2 mb-4 text-[var(--foreground-secondary)]">
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Vista previa PDF</span>
        </div>
        <div
          className="
            bg-white shadow-2xl mx-auto
            p-8 sm:p-10 max-w-[21cm]
            border border-gray-300
          "
          style={{
            fontFamily: "Helvetica, Arial, sans-serif",
            minHeight: "29.7cm",
          }}
        >
          <div className="prose prose-sm max-w-none text-gray-800">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

/**
 * Genera una vista previa del HTML que se exportaría.
 */
function generateHtmlPreview(markdownContent: string): string {
  // Una representación simplificada del HTML
  const htmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte de Pruebas</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; font-weight: 600; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
  </style>
</head>
<body>
  <main>
    <!-- Contenido generado desde Markdown -->
    ${markdownContent.substring(0, 500)}...
  </main>
</body>
</html>`;

  return htmlTemplate;
}

export default PreviewContent;
