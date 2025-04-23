import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  ImageRun,
  WidthType,
  AlignmentType,
} from "docx";

/**
 * Convierte un string Markdown en Paragraphs/Tables/ImageRuns docx.
 * - Reconoce tablas completas y les aplica ancho 100%
 * - Ignora la nota ℹ️ en Evidencias
 * - Inserta imágenes en base64 usando ImageRun
 * - Añade un párrafo vacío después de cada imagen para separarlas
 * - Elimina los fences ```log``` para que no aparezcan en el Word
 */
export function markdownToDocx(report: string) {
  // 1) Eliminar fences de logs (```log y ```)
  const cleaned = report
    .replace(/```log\s*\r?\n/, "")  // quita apertura del bloque de log
    .replace(/\r?\n```/, "");        // quita cierre del bloque de log

  const docElements: Array<Paragraph | Table> = [];

  // Título centrado
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({ text: "Reporte de Pruebas Realizadas", bold: true }),
      ],
    })
  );
  docElements.push(new Paragraph(""));

  const blocks = cleaned.split("\n\n");
  const imageRegex = /!\[.*\]\((data:image\/.+;base64,.+)\)/;

  for (const block of blocks) {
    // Saltar la nota de evidencias (si por alguna razón quedase)
    if (block.startsWith("> ℹ️")) continue;

    const lines = block.split("\n").map((l) => l.trim());

    // ¿Es tabla?
    if (lines[0].startsWith("|") && lines[1]?.startsWith("|")) {
      // parsear encabezado
      const headerCells = parseRow(lines[0]);
      const headerRow = new TableRow({
        children: headerCells.map((text) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text, bold: true })],
              }),
            ],
          })
        ),
      });

      // parsear filas de datos
      const dataRows: TableRow[] = [];
      for (let i = 2; i < lines.length; i++) {
        if (!lines[i].startsWith("|")) continue;
        const cells = parseRow(lines[i]);
        dataRows.push(
          new TableRow({
            children: cells.map((text) =>
              new TableCell({
                children: [new Paragraph(text)],
              })
            ),
          })
        );
      }

      docElements.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      docElements.push(new Paragraph(""));
      continue;
    }

    // Bloque normal (puede mezclar texto, negritas e imágenes)
    for (const line of lines) {
      // Imagen base64?
      const imgMatch = line.match(imageRegex);
      if (imgMatch) {
        const b64 = imgMatch[1].split(",")[1];
        const data = Buffer.from(b64, "base64");

        // Inserta la imagen
        docElements.push(
          new Paragraph({
            children: [
              new ImageRun({
                data,
                transformation: { width: 400, height: 300 },
              }),
            ],
          })
        );
        // …y un párrafo en blanco para separarlas
        docElements.push(new Paragraph(""));

        continue;
      }

      // Texto con **negrita**
      const parts = line.split("**");
      const runs: TextRun[] = parts.map((text, idx) =>
        new TextRun({ text, bold: idx % 2 === 1 })
      );
      docElements.push(new Paragraph({ children: runs }));
    }

    docElements.push(new Paragraph(""));
  }

  return docElements;
}

/**
 * Parseo de una línea de tabla Markdown:
 * 1) split("|") genera ["", "a", "", "b", ""]
 * 2) slice(1,-1) quita los bordes vacíos
 * 3) trim() a cada celda
 * 4) filtra solo la fila separadora de guiones
 */
function parseRow(line: string): string[] {
  return line
    .split("|")
    .slice(1, -1)
    .map((c) => c.trim())
    .filter((c) => !/^-+$/.test(c));
}