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
 */
export function markdownToDocx(report: string) {
  const docElements = [];

  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Reporte de Pruebas Realizadas", bold: true })],
    })
  );
  docElements.push(new Paragraph(""));

  const blocks = report.split("\n\n");

  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim());

    if (lines.length >= 2 && lines[0].startsWith("|") && lines[1].startsWith("|")) {
      const isEntorno = lines[0]
        .replace(/\*/g, "")
        .toLowerCase()
        .includes("parametros de configuracion");

      const tableOrParagraphs = buildDocxTable(lines, isEntorno);
      if (Array.isArray(tableOrParagraphs)) {
        docElements.push(...tableOrParagraphs);
      } else {
        docElements.push(tableOrParagraphs);
      }
      docElements.push(new Paragraph(""));
    } else {
      for (const line of lines) {
        if (
          (line.startsWith("📌") ||
            line.startsWith("🖥️") ||
            line.startsWith("✅") ||
            line.startsWith("📎") ||
            line.startsWith("📝") ||
            line.startsWith("📊") ||
            line.startsWith("🛠️") ||
            line.startsWith("📷") ||
            line.startsWith("💾")) &&
          line.includes("**")
        ) {
          const plainText = line.replace(/\*\*/g, "").trim();
          docElements.push(
            new Paragraph({
              spacing: { after: 100 }, // ~7 puntos de espacio (TWIP)
              children: [new TextRun({ text: plainText, bold: true })],
            })
          );
          docElements.push(new Paragraph(""));
        } else {
          const textRuns = parseBoldText(line);
          docElements.push(new Paragraph({ children: textRuns }));
        }
      }
      docElements.push(new Paragraph(""));
    }
  }

  return docElements;
}

function buildDocxTable(lines: string[], isEntorno: boolean): Table | Paragraph[] {
  const dataLines = lines.slice(2);

  if (isEntorno) {
    return dataLines
      .filter((line) => line.startsWith("|"))
      .map((line) => {
        const cells = parseTableRow(line);
        return new Paragraph({
          children: [
            new TextRun({ text: `${cells[0]}: `, bold: true }),
            new TextRun(cells[1] || ""),
          ],
        });
      });
  }

  const headerCells = parseTableRow(lines[0]);
  const tableRows: TableRow[] = [
    new TableRow({
      children: headerCells.map((text) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
        })
      ),
    }),
  ];

  for (const line of dataLines) {
    if (!line.startsWith("|")) continue;
    const cells = parseTableRow(line);
    const row = new TableRow({
      children: cells.map((text) => {
        const paragraphs = text.split("\\n").map((t) => new Paragraph({ children: [new TextRun(t.trim())] }));
        return new TableCell({ children: paragraphs });
      }),
    });
    tableRows.push(row);
  }

  return new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

function parseTableRow(line: string): string[] {
  return line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0 && !cell.startsWith("---"));
}

function parseBoldText(line: string): TextRun[] {
  return line.split("**").map((text, idx) => new TextRun({ text, bold: idx % 2 === 1 }));
}