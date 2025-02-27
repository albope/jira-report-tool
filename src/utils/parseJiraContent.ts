// src/utils/parseJiraContent.ts

export interface ParsedData {
  title: string;
  description: string;
}

export default function parseJiraContent(jiraContent: string): ParsedData {
  // Dividimos por líneas
  const lines = jiraContent.split("\n").map((line) => line.trim());

  // 1. Título: tomamos la primera línea (si no existe, placeholder)
  const title = lines[0] || "Título por defecto";

  // 2. Descripción: buscamos una línea que comience con "Descripción"
  let description = "Descripción no detectada (rellenar manualmente o parsear más)";
  const descIndex = lines.findIndex((line) =>
    line.toLowerCase().startsWith("descripción")
  );

  if (descIndex !== -1) {
    // A partir de descIndex+1, tomamos las líneas hasta encontrar otra sección o el final
    const descLines: string[] = [];
    for (let i = descIndex + 1; i < lines.length; i++) {
      // Si encontramos alguna palabra clave que indique otra sección,
      // como "NOTAS IMPLEMENTACIÓN" o "Corregir en", paramos.
      if (
        lines[i].toUpperCase().includes("CORREGIR EN") ||
        lines[i].toUpperCase().includes("NOTAS IMPLEMENTACIÓN")
      ) {
        break;
      }
      descLines.push(lines[i]);
    }

    // Si hay contenido, unimos con espacios o saltos de línea
    if (descLines.length > 0) {
      description = descLines.join(" ");
      // Si quieres mantener saltos de línea, podrías usar descLines.join("\n")
    }
  }

  return {
    title,
    description,
  };
}