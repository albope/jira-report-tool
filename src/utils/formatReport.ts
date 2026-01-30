// src/utils/formatReport.ts

import { ParsedData } from "./parseJiraContent"; // Ajusta la ruta si es necesario

// --- Interfaces (sin cambios, como las proporcionaste) ---
export interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[];  // base64
}
export interface Incidence { // Asegúrate que esta interfaz esté definida o importada si la usas
  id: string;
  description: string;
  impact: string;
  status: string;
}
export interface Summary { // Asegúrate que esta interfaz esté definida o importada
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}
export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}
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
  logsRelevantes?: string;
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
  customEnvFields: Array<{ label: string; value: string }>;
}
// --- Fin Interfaces ---


function formatStepsCell(steps: string): string {
  const lines = steps.split(/\r?\n/).filter((l) => l.trim());
  // Usar <br> para saltos de línea en celdas de tabla markdown
  return lines.map((l) => `• ${l.replace(/\|/g, '\\|')}`).join("<br>");
}

export default function formatReport(
  parsed: ParsedData,
  formData: FormData,
  hiddenFields: HiddenFields,
  targetOutput: 'jira' | 'docx' // <--- NUEVO PARÁMETRO
): string {
  const finalDate = formData.date || new Date().toISOString().split("T")[0];

  // --- Versiones (sin cambios) ---
  let versionTable = "";
  formData.versions.forEach((v) => {
    const appName = v.appName.trim().replace(/\|/g, '\\|');
    const appVersion = v.appVersion.trim().replace(/\|/g, '\\|');
    versionTable += `| ${appName} | ${appVersion} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // --- Batería de Pruebas (sin cambios) ---
  let batteryTable = `| ID Prueba | Descripción | Pasos | Resultado Esperado | Resultado Obtenido | Versión | Estado |\n`;
  batteryTable += `| --------- | ----------- | ----- | ------------------ | ------------------ | ------- | ------ |\n`;
  if (formData.batteryTests.length) {
    formData.batteryTests.forEach((bt) => {
      const id = bt.id.trim().replace(/\|/g, '\\|');
      const description = bt.description.replace(/\|/g, '\\|');
      const stepsFormatted = formatStepsCell(bt.steps);
      const expectedResult = bt.expectedResult.replace(/\|/g, '\\|');
      const obtainedResult = bt.obtainedResult.replace(/\|/g, '\\|');
      const testVersion = bt.testVersion.replace(/\|/g, '\\|');
      const testStatus = bt.testStatus.replace(/\|/g, '\\|');
      batteryTable += `| ${id} | ${description} | ${stepsFormatted} | ${expectedResult} | ${obtainedResult} | ${testVersion} | ${testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - | - | - |\n";
  }

  // --- Datos de Prueba (sin cambios) ---
  const datosDePrueba = formData.datosDePrueba?.trim() || "(Sin datos de prueba)";

  // --- Evidencias (MODIFICADO según targetOutput) ---
  let evidenciaSection = "";
  const testCasesWithImages = formData.batteryTests.filter((t) => t.images && t.images.length > 0);

  if (testCasesWithImages.length > 0) {
    if (targetOutput === 'jira') {
      const imagePlaceholders = testCasesWithImages.map(t => {
        const cleanId = t.id.trim();
        const numImages = t.images!.length;
        const imageNoun = numImages === 1 ? "imagen" : "imágenes";
        return `* Para el caso de prueba **${cleanId}**: Se han adjuntado ${numImages} ${imageNoun}. Por favor, consúltelas en el documento Word adjunto o en el comentario aparte.`;
      }).join("\n");
      evidenciaSection = imagePlaceholders;
      if (!evidenciaSection) { // En caso de que el map no produzca nada (aunque filter ya lo asegura)
        evidenciaSection = "(No hay evidencias que listar para JIRA, pero compruebe el Word si se indica carga de imágenes).";
      }
    } else { // targetOutput === 'docx'
      evidenciaSection = testCasesWithImages.map((t) => {
        const cleanId = t.id.trim();
        const header = `**Imágenes adjuntas del caso de prueba ${cleanId}**`;
        // Asegurarse de que t.images no es undefined antes de llamar a map
        const imgs = t.images ? t.images.map((src, i) => 
            src ? `![${cleanId} – Evidencia ${i + 1}](${src})` : `[Referencia a Evidencia ${i + 1} para ${cleanId} no disponible]`
        ).join("\n\n") : ""; // doble salto para separarlas
        return `${header}\n\n${imgs}`;
      }).join("\n\n"); // doble salto entre casos
    }
  } else {
    evidenciaSection = "(No hay evidencias adjuntas)";
  }


  // --- Logs Relevantes (sin cambios) ---
  let logsSection = "";
  if (formData.logsRelevantes && formData.logsRelevantes.trim()) {
    logsSection = "```log\n" + formData.logsRelevantes.trim() + "\n```";
  } else {
    logsSection = "(No se adjuntaron logs)";
  }

  // --- Resumen de Resultados (sin cambios) ---
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  const observations = formData.summary.observations.replace(/\|/g, '\\|') || "(N/A)";
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${formData.summary.successfulTests || "0"} | ${formData.summary.failedTests || "0"} | ${observations} |\n`;

  // --- Incidencias (sin cambios) ---
  let incidSection = "";
  if (formData.hasIncidences && formData.incidences.length) {
    incidSection += `| **ID Prueba** | **Descripción** | **Impacto** | **Estado** |\n`;
    incidSection += `| ------------- | --------------- | ----------- | ---------- |\n`;
    formData.incidences.forEach((inc) => {
      const id = inc.id.trim().replace(/\|/g, '\\|');
      const description = inc.description.replace(/\|/g, '\\|');
      const impact = inc.impact.replace(/\|/g, '\\|');
      const status = inc.status.replace(/\|/g, '\\|');
      incidSection += `| ${id} | ${description} | ${impact} | ${status} |\n`;
    });
  } else {
    incidSection = "No se detectaron incidencias durante las pruebas.";
  }

  // --- Entorno de Pruebas (sin cambios) ---
  const entornoPairs: [string, string][] = [];
  if (!hiddenFields.serverPruebas && formData.serverPruebas.trim()) { entornoPairs.push(["Servidor de Pruebas", formData.serverPruebas]); }
  if (!hiddenFields.ipMaquina && formData.ipMaquina.trim()) { entornoPairs.push(["IP Máquina", formData.ipMaquina]); }
  if (!hiddenFields.navegador && formData.navegador.trim()) { entornoPairs.push(["Navegador", formData.navegador]); }
  if (!hiddenFields.baseDatos && formData.baseDatos.trim()) { entornoPairs.push(["Base de Datos", formData.baseDatos]); }
  if (!hiddenFields.maquetaUtilizada && formData.maquetaUtilizada.trim()) { entornoPairs.push(["Maqueta Utilizada", formData.maquetaUtilizada]); }
  if (!hiddenFields.ambiente && formData.ambiente.trim()) { entornoPairs.push(["Ambiente", formData.ambiente]); }
  formData.customEnvFields.forEach((f) => { if (f.label.trim() && f.value.trim()) { entornoPairs.push([f.label.trim(), f.value.trim()]); } });
  const entornoList = entornoPairs.map(([k, v]) => `**${k}:** ${v}`).join("\n");

  // --- Sección APP (sin cambios) ---
  const appSection = formData.isApp ? `
📱 **Validación de Aplicación**

| **Campo** | **Detalle** |
|---|---|
| Endpoint | ${formData.endpoint?.replace(/\|/g, '\\|') || "(N/A)"} |
| Sistema Operativo / Versión | ${formData.sistemaOperativo?.replace(/\|/g, '\\|') || "(N/A)"} |
| Dispositivo de Pruebas | ${formData.dispositivoPruebas?.replace(/\|/g, '\\|') || "(N/A)"} |
| Precondiciones | ${formData.precondiciones?.replace(/\|/g, '\\|') || "(N/A)"} |
| Idioma | ${formData.idioma?.replace(/\|/g, '\\|') || "(N/A)"} |
` : "";

  // --- Montaje final (sin cambios en la estructura general) ---
  return `
📌 **Información General**
**Título:** ${parsed.title}
**Código de JIRA:** ${formData.jiraCode}
**Fecha de Prueba:** ${finalDate}
**Tester:** ${formData.tester}
**Estado de la Prueba:** ${formData.testStatus}


📌 **Versiones del Sistema**

| **Aplicativo** | **Versión** |
|---|---|
${versionTable.trim()}


🖥️ **Entorno de Pruebas**

${entornoList.trim() ? entornoList : "(No se especificó entorno)"}

${appSection.trim() ? '\n' + appSection.trim() + '\n' : ''}
✅ **Batería de Pruebas**

${batteryTable.trim()}


💾 **Datos de Prueba**

${datosDePrueba}


📎 **Evidencias**

${evidenciaSection.trim()}


📝 **Logs Relevantes**

${logsSection}


📊 **Resumen de Resultados**

${summaryTable.trim()}


🛠️ **Incidencias Detectadas**

${incidSection.includes('|') ? '\n' + incidSection.trim() : incidSection}


📌 **Conclusiones**

${formData.conclusion.trim() || "(Sin conclusiones)"}
`;
}