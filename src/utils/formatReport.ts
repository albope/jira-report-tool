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
  images?: string[];  // NUEVO: base64
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
  return lines.map((l) => `- ${l}`).join(" \\n ");
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
    versionTable += `| ${v.appName.trim()} | ${v.appVersion.trim()} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // --- Batería de Pruebas ---
  let batteryTable = `| ID Prueba | Descripción | Pasos | Resultado Esperado | Resultado Obtenido | Versión | Estado |\n`;
  batteryTable += `| --------- | ----------- | ----- | ------------------ | ------------------ | ------- | ------ |\n`;
  if (formData.batteryTests.length) {
    formData.batteryTests.forEach((bt) => {
      batteryTable += `| ${bt.id} | ${bt.description} | ${formatStepsCell(bt.steps)} | ${bt.expectedResult} | ${bt.obtainedResult} | ${bt.testVersion} | ${bt.testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - | - | - |\n";
  }

  // --- Datos de Prueba ---
  const datosDePrueba = formData.datosDePrueba?.trim() || "(Sin datos de prueba)";

  // --- Evidencias (imágenes y ZIP) ---
  const allImages = formData.batteryTests.flatMap((t) => t.images || []);
  const evidenciaSection = allImages.length
    ? allImages
        .map((src, i) => `![Evidencia ${i + 1}](${src})`)
        .join("\n")
    : '"Adjuntar capturas de pantalla relevantes"';
  const zipLink = "[📦 Descargar evidencias (ZIP)]";

  // --- Logs Relevantes ---
  const logsSection = `"Adjuntar logs del sistema o registros relevantes"`;

  // --- Resumen de Resultados ---
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${formData.summary.successfulTests ||
    "0"} | ${formData.summary.failedTests || "0"} | ${formData.summary.observations ||
    "(N/A)"} |\n`;

  // --- Incidencias ---
  let incidSection = "";
  if (formData.hasIncidences && formData.incidences.length) {
    incidSection += `| **ID Prueba** | **Descripción** | **Impacto** | **Estado** |\n`;
    incidSection += `| ------------- | --------------- | ----------- | ---------- |\n`;
    formData.incidences.forEach((inc) => {
      incidSection += `| ${inc.id} | ${inc.description} | ${inc.impact} | ${inc.status} |\n`;
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
    if (f.label.trim() && f.value.trim()) entornoPairs.push([f.label, f.value]);
  });
  const entornoList = entornoPairs.map(([k, v]) => `**${k}:** ${v}`).join("\n");

  // --- Sección APP ---
  const appSection = formData.isApp
    ? `
📱 **Validación de Aplicación**

| **Campo**                    | **Detalle**                             |
| ---------------------------- | --------------------------------------- |
| Endpoint                     | ${formData.endpoint || "(N/A)"}         |
| Sistema Operativo / Versión  | ${formData.sistemaOperativo || "(N/A)"} |
| Dispositivo de Pruebas       | ${formData.dispositivoPruebas || "(N/A)"} |
| Precondiciones               | ${formData.precondiciones || "(N/A)"}   |
| Idioma                       | ${formData.idioma || "(N/A)"}           |
`
    : "";

  // --- Montaje final en el orden solicitado ---
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
${entornoList.trim()}

${appSection.trim()}

✅ **Batería de Pruebas**

${batteryTable.trim()}

💾 **Datos de Prueba**
${datosDePrueba}

📎 **Evidencias**
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