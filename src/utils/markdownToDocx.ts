// src/utils/markdownToDocx.ts

import { Paragraph, Table, TableCell, TableRow, TextRun } from "docx";

/**
 * Convierte un string con Markdown simplificado (report)
 * a un array de docx.Paragraph y docx.Table nativos.
 * - Detecta bloques de tabla vs bloques de texto.
 * - Las tablas deben tener al menos 2 líneas y empezar con "|".
 */
export function markdownToDocx(report: string): Array<Paragraph | Table> {
  // Dividimos por doble salto de línea para separar bloques
  const blocks = report.split("\n\n");
  const docElements: Array<Paragraph | Table> = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());
    // Detectar si es tabla (muy simplificado):
    // 1) Mínimo 2 líneas.
    // 2) Primera y segunda empiezan con "|".
    if (
      lines.length >= 2 &&
      lines[0].startsWith("|") &&
      lines[1].startsWith("|")
    ) {
      // Es una tabla
      const table = buildDocxTable(lines);
      docElements.push(table);
    } else {
      // Texto normal: cada línea => un Paragraph
      for (const line of lines) {
        docElements.push(
          new Paragraph({
            children: [new TextRun(line)],
          })
        );
      }
    }
  }

  return docElements;
}

/**
 * Construye una tabla docx nativa a partir de líneas Markdown.
 * lines[0] => encabezado (por ej: "| Col1 | Col2 | Col3 |")
 * lines[1] => separador (por ej: "| --- | --- | --- |")
 * lines[2..] => filas de datos.
 */
function buildDocxTable(lines: string[]): Table {
  const headerLine = lines[0];
  const dataLines = lines.slice(2);

  // Parseamos el encabezado
  const headerCells = parseTableRow(headerLine);

  // Creamos la fila de encabezado en docx
  const tableRows = [
    new TableRow({
      children: headerCells.map(
        (cellText) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun(cellText)] })],
          })
      ),
    }),
  ];

  // Parseamos las filas de datos
  for (const dataLine of dataLines) {
    if (!dataLine.startsWith("|")) {
      continue;
    }
    const cells = parseTableRow(dataLine);
    const row = new TableRow({
      children: cells.map(
        (cellText) =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun(cellText)] })],
          })
      ),
    });
    tableRows.push(row);
  }

  return new Table({
    rows: tableRows,
  });
}

/**
 * Dada una línea de Markdown de tabla, por ej:
 * "| Col1 | Col2 | Col3 |"
 * retorna un array ["Col1", "Col2", "Col3"] sin espacios extra.
 */
function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0 && !cell.startsWith("---"));
}