import {
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  ImageRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
  HeadingLevel,
  convertInchesToTwip,
  ITableCellOptions,
} from "docx";

// Colores corporativos para el documento
const COLORS = {
  primary: "2563EB",      // Azul principal
  headerBg: "F1F5F9",     // Gris claro para headers de tabla
  borderColor: "CBD5E1",  // Gris para bordes
  sectionTitle: "1E40AF", // Azul oscuro para títulos de sección
};

// Configuración de bordes de tabla
const TABLE_BORDERS = {
  top: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
  left: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
  right: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
  insideVertical: { style: BorderStyle.SINGLE, size: 1, color: COLORS.borderColor },
};

// Configuración de sombreado para headers de tabla
const HEADER_SHADING: ITableCellOptions["shading"] = {
  type: ShadingType.SOLID,
  color: COLORS.headerBg,
  fill: COLORS.headerBg,
};

/**
 * Detecta si una línea es un encabezado de sección (empieza con emoji y tiene texto en negrita)
 * Ejemplos: "📌 **Información General**", "✅ **Batería de Pruebas**"
 */
function isSectionHeader(line: string): boolean {
  // Patrón: emoji opcional + espacio + **texto**
  return /^[📌🖥️✅💾📎📝📊🛠️📱]\s*\*\*.+\*\*$/.test(line.trim());
}

/**
 * Extrae el texto del encabezado de sección (sin emoji ni asteriscos)
 */
function extractSectionTitle(line: string): string {
  // Quitar emoji del inicio y asteriscos
  return line.replace(/^[📌🖥️✅💾📎📝📊🛠️📱]\s*/, "").replace(/\*\*/g, "").trim();
}

/**
 * Procesa texto con negritas y saltos de línea <br>
 * Retorna un array de TextRun
 */
function processTextWithFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];

  // Primero dividir por <br> para manejar saltos de línea
  const segments = text.split(/<br\s*\/?>/gi);

  segments.forEach((segment, segmentIndex) => {
    // Procesar negritas en cada segmento
    const parts = segment.split("**");
    parts.forEach((part, idx) => {
      if (part) {
        runs.push(new TextRun({
          text: part,
          bold: idx % 2 === 1,
        }));
      }
    });

    // Agregar salto de línea entre segmentos (excepto el último)
    if (segmentIndex < segments.length - 1) {
      runs.push(new TextRun({ break: 1 }));
    }
  });

  return runs;
}

/**
 * Procesa el contenido de una celda de tabla que puede contener bullets y <br>
 */
function processTableCellContent(text: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Dividir por <br> para crear párrafos separados
  const lines = text.split(/<br\s*\/?>/gi);

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      // Procesar negritas dentro de la línea
      const runs = processTextWithFormatting(trimmedLine);
      paragraphs.push(new Paragraph({
        children: runs,
        spacing: { after: 40 }, // Pequeño espacio entre líneas
      }));
    }
  });

  // Si no hay contenido, devolver un párrafo vacío
  if (paragraphs.length === 0) {
    paragraphs.push(new Paragraph(""));
  }

  return paragraphs;
}

/**
 * Convierte un string Markdown en Paragraphs/Tables/ImageRuns docx.
 * - Reconoce tablas completas y les aplica ancho 100% con bordes
 * - Ignora la nota ℹ️ en Evidencias
 * - Inserta imágenes en base64 usando ImageRun
 * - Procesa encabezados de sección con estilo distintivo
 * - Maneja saltos de línea <br> correctamente
 * - Aplica sombreado a headers de tabla
 */
export function markdownToDocx(report: string): Array<Paragraph | Table> {
  // 1) Eliminar fences de logs (```log y ```)
  const cleaned = report
    .replace(/```log\s*\r?\n/g, "")  // quita apertura del bloque de log
    .replace(/\r?\n```/g, "");        // quita cierre del bloque de log

  const docElements: Array<Paragraph | Table> = [];

  // Título principal centrado con estilo
  docElements.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      spacing: { after: convertInchesToTwip(0.3) },
      children: [
        new TextRun({
          text: "Reporte de Pruebas Realizadas",
          bold: true,
          size: 48, // 24pt (en half-points)
          color: COLORS.primary,
        }),
      ],
    })
  );
  docElements.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.2) } }));

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
        tableHeader: true,
        children: headerCells.map((text) =>
          new TableCell({
            shading: HEADER_SHADING,
            children: [
              new Paragraph({
                children: [new TextRun({
                  text: text.replace(/\*\*/g, ""), // Quitar ** del texto
                  bold: true,
                  size: 20, // 10pt
                })],
              }),
            ],
            margins: {
              top: convertInchesToTwip(0.05),
              bottom: convertInchesToTwip(0.05),
              left: convertInchesToTwip(0.1),
              right: convertInchesToTwip(0.1),
            },
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
                children: processTableCellContent(text),
                margins: {
                  top: convertInchesToTwip(0.05),
                  bottom: convertInchesToTwip(0.05),
                  left: convertInchesToTwip(0.1),
                  right: convertInchesToTwip(0.1),
                },
              })
            ),
          })
        );
      }

      docElements.push(
        new Table({
          rows: [headerRow, ...dataRows],
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: TABLE_BORDERS,
        })
      );
      docElements.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.15) } }));
      continue;
    }

    // Bloque normal (puede mezclar texto, negritas e imágenes)
    for (const line of lines) {
      // Verificar si es un encabezado de sección
      if (isSectionHeader(line)) {
        const title = extractSectionTitle(line);
        docElements.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: {
              before: convertInchesToTwip(0.25),
              after: convertInchesToTwip(0.1)
            },
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 28, // 14pt
                color: COLORS.sectionTitle,
              }),
            ],
          })
        );
        continue;
      }

      // Imagen base64?
      const imgMatch = line.match(imageRegex);
      if (imgMatch) {
        try {
          const b64Parts = imgMatch[1].split(",");
          const b64 = b64Parts[1];

          // Validar que existe el contenido base64
          if (!b64) {
            console.warn("Imagen con formato base64 inválido, saltando...");
            continue;
          }

          const data = Buffer.from(b64, "base64");

          // Obtener dimensiones de la imagen para mantener aspect ratio
          // Por defecto usamos 500px de ancho máximo con altura proporcional
          const maxWidth = 500;
          const estimatedHeight = 375; // Ratio 4:3 por defecto

          // Inserta la imagen centrada
          docElements.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: convertInchesToTwip(0.1) },
              children: [
                new ImageRun({
                  data,
                  transformation: {
                    width: maxWidth,
                    height: estimatedHeight,
                  },
                }),
              ],
            })
          );
          // Párrafo espaciador después de la imagen
          docElements.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.15) } }));
        } catch (error) {
          console.error("Error procesando imagen base64:", error);
          // Agregar placeholder de texto si falla la imagen
          docElements.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: "[Error al cargar imagen]",
                  italics: true,
                  color: "999999",
                }),
              ],
            })
          );
        }
        continue;
      }

      // Texto normal con posibles negritas y <br>
      if (line.trim()) {
        const runs = processTextWithFormatting(line);
        docElements.push(new Paragraph({
          children: runs,
          spacing: { after: 80 }, // Pequeño espacio entre párrafos
        }));
      }
    }

    docElements.push(new Paragraph({ spacing: { after: convertInchesToTwip(0.1) } }));
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