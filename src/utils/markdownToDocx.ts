// src/utils/markdownToDocx.ts

import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
} from "docx";

/**
 * Convierte un string con Markdown simplificado (report) a un array de docx.Paragraph y docx.Table nativos.
 * - Añade un título general “Reporte de Pruebas Realizadas” al inicio, en negrita y centrado.
 * - Detecta bloques de texto vs tablas.
 * - Reconoce encabezados con ciertos emojis.
 * - Añade una línea en blanco tras cada heading y cada tabla.
 * - Parsear negrita en las líneas normales que tengan **texto**.
 */
export function markdownToDocx(report: string) {
  const docElements = [];

  // 1) Título general centrado y en negrita
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "Reporte de Pruebas Realizadas",
          bold: true,
        }),
      ],
    })
  );
  docElements.push(new Paragraph("")); // línea en blanco

  // 2) Dividir en bloques por doble salto de línea
  const blocks = report.split("\n\n");

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());

    // A) Si es tabla (mínimo 2 líneas y ambas empiezan con "|")
    if (
      lines.length >= 2 &&
      lines[0].startsWith("|") &&
      lines[1].startsWith("|")
    ) {
      const table = buildDocxTable(lines);
      docElements.push(table);

      // Párrafo en blanco tras la tabla
      docElements.push(new Paragraph(""));
    }
    // B) Texto normal
    else {
      // Recorremos cada línea
      for (const line of lines) {
        // B.1) ¿Es encabezado con emoji y "**"?
        if (
          (line.startsWith("📌") ||
            line.startsWith("🖥️") ||
            line.startsWith("✅") ||
            line.startsWith("📎") ||
            line.startsWith("📝") ||
            line.startsWith("📊") ||
            line.startsWith("🛠️") ||
            line.startsWith("📷")) &&
          line.includes("**")
        ) {
          // Quitar los "**"
          const plainText = line.replace(/\*\*/g, "").trim();
          docElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: plainText,
                  bold: true,
                }),
              ],
            })
          );
          docElements.push(new Paragraph("")); // línea en blanco
        }
        // B.2) Línea normal: parsear la negrita interna
        else {
          // Parsear la negrita interna: buscamos **algo** y lo convertimos en TextRun bold
          // Ejemplo simple: partimos la línea en tokens por "**"
          // (asumiendo que siempre vienen en pares)
          const textRuns = parseBoldText(line);

          docElements.push(
            new Paragraph({
              children: textRuns,
            })
          );
        }
      }
      // Tras cada bloque de texto, párrafo en blanco
      docElements.push(new Paragraph(""));
    }
  }

  return docElements;
}

/**
 * Crea una tabla docx a partir de líneas Markdown (primera = encabezado, segunda = separador, resto = filas).
 */
function buildDocxTable(lines: string[]): Table {
  const headerLine = lines[0];
  const dataLines = lines.slice(2);

  // Encabezado
  const headerCells = parseTableRow(headerLine);

  // Fila de encabezado (negrita)
  const tableRows: TableRow[] = [
    new TableRow({
      children: headerCells.map((cellText) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: cellText, bold: true })],
            }),
          ],
        })
      ),
    }),
  ];

  // Filas de datos
  for (const dataLine of dataLines) {
    if (!dataLine.startsWith("|")) continue;
    const cells = parseTableRow(dataLine);

    const row = new TableRow({
      children: cells.map((cellText) => {
        // Dividir por "\\n" si queremos saltos de línea dentro de la celda
        const splitted = cellText.split("\\n");
        const paragraphs =
          splitted.length > 0
            ? splitted.map(
                (line) =>
                  new Paragraph({
                    children: [new TextRun(line.trim())],
                  })
              )
            : [new Paragraph("")];

        return new TableCell({ children: paragraphs });
      }),
    });

    tableRows.push(row);
  }

  return new Table({
    rows: tableRows,
    width: { size: 100, type: WidthType.PERCENTAGE }, // ancho completo
  });
}

/**
 * Parsea una fila de Markdown de tabla, por ej:
 * "| Col1 | Col2 | Col3 |"
 * => ["Col1", "Col2", "Col3"]
 */
function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0 && !cell.startsWith("---"));
}

/**
 * parseBoldText(line):
 * Dada una línea, reemplaza los fragmentos entre ** ** por TextRun bold.
 * Ej: "Hola **Mundo** y **Pruebas**"
 * => [TextRun("Hola "), TextRun("Mundo", bold: true), TextRun(" y "), TextRun("Pruebas", bold: true)]
 */
function parseBoldText(line: string): TextRun[] {
  const parts = line.split("**");
  const runs: TextRun[] = [];

  // parts vendrá algo como: ["Hola ", "Mundo", " y ", "Pruebas", ""]
  // cada par 1..2 => negrita, 3..4 => negrita, etc.
  parts.forEach((fragment, index) => {
    if (fragment === "") return; // ignorar vacíos puros

    // si el index es impar => fragmento en negrita
    const isBold = index % 2 === 1;

    runs.push(new TextRun({ text: fragment, bold: isBold }));
  });

  return runs;
}