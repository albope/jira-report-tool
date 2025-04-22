import { ParsedData } from "./parseJiraContent";

/** Estructura de la batería */
interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[];  // base64
}

/** Incidencias */
interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

/** Resumen */
interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

/** Campos ocultables */
export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

/** FormData */
export interface FormData {
  jiraCode: string;
  date: string;
  tester: string;
  testStatus: string;
  versions: Array<{ appName: string; appVersion: string }>;
  serverPruebas: string;
  ipMaquina: string;
  navegador: string;
  baseDatos: string;
  maquetaUtilizada: string;
  ambiente: string;
  batteryTests: BatteryTest[];
  summary: Summary;
  incidences: Incidence[];
  hasIncidences: boolean;
  conclusion: string;
  datosDePrueba: string;
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
  customEnvFields: Array<{ label: string; value: string }>;
}

/** Helper para formatear pasos multiline en bullet points */
function formatStepsCell(steps: string): string {
  const lines = steps.split(/\r?\n/).filter((l) => l.trim());
  // Escapar caracteres especiales de Markdown dentro de las celdas si es necesario
  // y reemplazar saltos de línea literales con <br> o similar si el visor lo soporta en tablas.
  // Aquí usamos \\n que algunos visores podrían interpretar. Ajustar si es necesario.
  return lines.map((l) => `- ${l.replace(/\|/g, '\\|')}`).join(" \\n ");
}

export default function formatReport(
  parsed: ParsedData,
  formData: FormData,
  hiddenFields: HiddenFields
): string {
  const finalDate = formData.date || new Date().toISOString().split("T")[0];

  // --- Versiones ---
  let versionTable = "";
  formData.versions.forEach((v) => {
    // Asegurarse que el contenido no rompa la tabla
    const appName = v.appName.trim().replace(/\|/g, '\\|');
    const appVersion = v.appVersion.trim().replace(/\|/g, '\\|');
    versionTable += `| ${appName} | ${appVersion} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // --- Batería de Pruebas ---
  let batteryTable = `| ID Prueba | Descripción | Pasos | Resultado Esperado | Resultado Obtenido | Versión | Estado |\n`;
  batteryTable += `| --------- | ----------- | ----- | ------------------ | ------------------ | ------- | ------ |\n`;
  if (formData.batteryTests.length) {
    formData.batteryTests.forEach((bt) => {
      // Limpiar y escapar contenido para la tabla
      const id = bt.id.trim().replace(/\|/g, '\\|');
      const description = bt.description.replace(/\|/g, '\\|');
      const stepsFormatted = formatStepsCell(bt.steps); // formatStepsCell ya escapa "|"
      const expectedResult = bt.expectedResult.replace(/\|/g, '\\|');
      const obtainedResult = bt.obtainedResult.replace(/\|/g, '\\|');
      const testVersion = bt.testVersion.replace(/\|/g, '\\|');
      const testStatus = bt.testStatus.replace(/\|/g, '\\|');

      batteryTable += `| ${id} | ${description} | ${stepsFormatted} | ${expectedResult} | ${obtainedResult} | ${testVersion} | ${testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - | - | - |\n";
  }

  // --- Datos de Prueba ---
  const datosDePrueba = formData.datosDePrueba?.trim() || "(Sin datos de prueba)";

  // --- Evidencias (imágenes agrupadas por caso) ---
  const evidenciaSection = formData.batteryTests
    .filter((t) => t.images && t.images.length > 0) // Asegurar que el array existe y tiene elementos
    .map((t) => {
      const cleanId = t.id.trim(); // Limpiar ID una vez

      // === CAMBIO 2: Título descriptivo + ID ===
      const header = `**Imágenes adjuntas del caso de prueba ${cleanId}**`;

      const imgs = t.images! // Asumimos que t.images no es null/undefined por el filter
        // === CAMBIO 3: Usar ID limpio en Alt Text ===
        .map((src, i) => `![${cleanId} – Evidencia ${i + 1}](${src})`)
        .join("\n"); // Las imágenes se unen con un solo salto de línea

      // === CAMBIO 1: Doble salto de línea entre título e imágenes ===
      return `${header}\n\n${imgs}`;
    })
    .join("\n\n") // Los bloques de diferentes casos se unen con doble salto de línea
    || '"(No hay evidencias adjuntas)"'; // Mensaje si no hay imágenes en ningún caso

  // --- Logs Relevantes ---
  // Considerar si esto debería ser un campo de texto en el formulario
  const logsSection = `"(Adjuntar logs del sistema o registros relevantes si aplica)"`;

  // --- Resumen de Resultados ---
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  // Escapar observaciones por si contienen "|"
  const observations = formData.summary.observations.replace(/\|/g, '\\|') || "(N/A)";
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${formData.summary.successfulTests || "0"} | ${formData.summary.failedTests || "0"} | ${observations} |\n`;

  // --- Incidencias ---
  let incidSection = "";
  if (formData.hasIncidences && formData.incidences.length) {
    incidSection += `| **ID Prueba** | **Descripción** | **Impacto** | **Estado** |\n`;
    incidSection += `| ------------- | --------------- | ----------- | ---------- |\n`;
    formData.incidences.forEach((inc) => {
      // Limpiar y escapar contenido para la tabla
      const id = inc.id.trim().replace(/\|/g, '\\|');
      const description = inc.description.replace(/\|/g, '\\|');
      const impact = inc.impact.replace(/\|/g, '\\|');
      const status = inc.status.replace(/\|/g, '\\|');
      incidSection += `| ${id} | ${description} | ${impact} | ${status} |\n`;
    });
  } else {
    incidSection = "No se detectaron incidencias durante las pruebas.";
  }

  // --- Entorno de Pruebas ---
  const entornoPairs: [string, string][] = [];
  if (!hiddenFields.serverPruebas && formData.serverPruebas.trim()) {
    entornoPairs.push(["Servidor de Pruebas", formData.serverPruebas]);
  }
  if (!hiddenFields.ipMaquina && formData.ipMaquina.trim()) {
    entornoPairs.push(["IP Máquina", formData.ipMaquina]);
  }
  if (!hiddenFields.navegador && formData.navegador.trim()) {
    entornoPairs.push(["Navegador", formData.navegador]);
  }
  if (!hiddenFields.baseDatos && formData.baseDatos.trim()) {
    entornoPairs.push(["Base de Datos", formData.baseDatos]);
  }
  if (!hiddenFields.maquetaUtilizada && formData.maquetaUtilizada.trim()) {
    entornoPairs.push(["Maqueta Utilizada", formData.maquetaUtilizada]);
  }
  if (!hiddenFields.ambiente && formData.ambiente.trim()) {
    entornoPairs.push(["Ambiente", formData.ambiente]);
  }
  formData.customEnvFields.forEach((f) => {
    if (f.label.trim() && f.value.trim()) {
      // Escapar posible markdown en label/value si se quiere mostrar literal
      entornoPairs.push([f.label.trim(), f.value.trim()]);
    }
  });
  const entornoList = entornoPairs
    .map(([k, v]) => `**${k}:** ${v}`) // Asume que k y v no necesitan más escape aquí
    .join("\n");

  // --- Sección APP ---
  const appSection = formData.isApp
    ? `
📱 **Validación de Aplicación**

| **Campo** | **Detalle** |
| ---------------------------- | --------------------------------------- |
| Endpoint                     | ${formData.endpoint?.replace(/\|/g, '\\|') || "(N/A)"}       |
| Sistema Operativo / Versión  | ${formData.sistemaOperativo?.replace(/\|/g, '\\|') || "(N/A)"} |
| Dispositivo de Pruebas       | ${formData.dispositivoPruebas?.replace(/\|/g, '\\|') || "(N/A)"} |
| Precondiciones               | ${formData.precondiciones?.replace(/\|/g, '\\|') || "(N/A)"}   |
| Idioma                       | ${formData.idioma?.replace(/\|/g, '\\|') || "(N/A)"}         |
`
    : "";

  // --- Montaje final en el orden solicitado ---
  // Usamos trim() en las secciones de tabla para quitar el último \n si existe
  return `
📌 **Información General**
**Título:** ${parsed.title}
**Código de JIRA:** ${formData.jiraCode}
**Fecha de Prueba:** ${finalDate}
**Tester:** ${formData.tester}
**Estado de la Prueba:** ${formData.testStatus}

📌 **Versiones del Sistema**

| **Aplicativo** | **Versión** |
| -------------- | ----------- |
${versionTable.trim()}

🖥️ **Entorno de Pruebas**
${entornoList}

${appSection.trim()}

✅ **Batería de Pruebas**

${batteryTable.trim()}

💾 **Datos de Prueba**
${datosDePrueba}

📎 **Evidencias**

${''}
${evidenciaSection}

📝 **Logs Relevantes**
${logsSection}

📊 **Resumen de Resultados**

${summaryTable.trim()}

🛠️ **Incidencias Detectadas**
${incidSection.trim()}

📌 **Conclusiones**
${formData.conclusion || "(Sin conclusiones)"}
`;
}