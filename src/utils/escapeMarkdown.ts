/**
 * Utilidades para escapar caracteres especiales en Markdown
 * Usadas principalmente para generar tablas JIRA sin romper el formato
 */

/**
 * Escapa caracteres que rompen tablas Markdown
 * - | (pipe) - separador de columnas
 * - ** (asteriscos dobles) - negritas
 * - \n (saltos de línea) - rompen filas
 */
export function escapeForMarkdownTable(text: string | undefined | null): string {
  if (!text) return "";

  return text
    .trim()
    .replace(/\|/g, "\\|")      // Escapar pipes
    .replace(/\*\*/g, "\\*\\*")  // Escapar negritas
    .replace(/\n/g, " ");        // Reemplazar saltos de línea por espacios
}

/**
 * Escapa solo pipes para celdas de tabla
 * Versión más ligera cuando no se esperan otros caracteres problemáticos
 */
export function escapePipes(text: string | undefined | null): string {
  if (!text) return "";
  return text.trim().replace(/\|/g, "\\|");
}

/**
 * Limpia y normaliza texto para uso general en reportes
 * No escapa caracteres, solo normaliza espacios
 */
export function normalizeText(text: string | undefined | null): string {
  if (!text) return "";
  return text.trim().replace(/\s+/g, " ");
}
