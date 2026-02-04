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


function formatStepsCell(steps: string, targetOutput: 'jira' | 'docx'): string {
  const lines = steps.split(/\r?\n/).filter((l) => l.trim());

  if (targetOutput === 'jira') {
    // Para JIRA: usar formato numerado inline separado por " | " que es más legible
    // y no causa problemas de parsing en tablas
    return lines.map((l, i) => `${i + 1}. ${l.replace(/\|/g, '/')}`).join(" ║ ");
  }

  // Para DOCX: usar <br> para saltos de línea que el convertidor puede manejar
  return lines.map((l) => `• ${l.replace(/\|/g, '\\|')}`).join("<br>");
}

// Helper para formatear texto en negrita según el formato de salida
function bold(text: string, targetOutput: 'jira' | 'docx'): string {
  return targetOutput === 'jira' ? `*${text}*` : `**${text}**`;
}

// Helper para crear tablas en formato JIRA wiki o Markdown
function createTable(
  headers: string[],
  rows: string[][],
  targetOutput: 'jira' | 'docx'
): string {
  if (targetOutput === 'jira') {
    // JIRA Wiki format: ||Header1||Header2|| y |Cell1|Cell2|
    const headerRow = '||' + headers.join('||') + '||';
    const dataRows = rows.map(row => '|' + row.join('|') + '|').join('\n');
    return headerRow + '\n' + dataRows;
  } else {
    // Markdown format
    const headerRow = '| ' + headers.join(' | ') + ' |';
    const separator = '| ' + headers.map(() => '---').join(' | ') + ' |';
    const dataRows = rows.map(row => '| ' + row.join(' | ') + ' |').join('\n');
    return headerRow + '\n' + separator + '\n' + dataRows;
  }
}

export default function formatReport(
  parsed: ParsedData,
  formData: FormData,
  hiddenFields: HiddenFields,
  targetOutput: 'jira' | 'docx' // <--- NUEVO PARÁMETRO
): string {
  const finalDate = formData.date || new Date().toISOString().split("T")[0];
  const b = (text: string) => bold(text, targetOutput);

  // --- Versiones ---
  const versionHeaders = [b('Aplicativo'), b('Versión')];
  const versionRows: string[][] = formData.versions.length > 0
    ? formData.versions.map(v => [
        v.appName.trim().replace(/\|/g, '/'),
        v.appVersion.trim().replace(/\|/g, '/')
      ])
    : [['(No hay versiones)', '(N/A)']];
  const versionTable = createTable(versionHeaders, versionRows, targetOutput);

  // --- Batería de Pruebas ---
  const batteryHeaders = ['ID', 'Descripción', 'Pasos', 'Resultado Esperado', 'Resultado Obtenido', 'Versión', 'Estado'];
  const batteryRows: string[][] = formData.batteryTests.length > 0
    ? formData.batteryTests.map(bt => [
        bt.id.trim().replace(/\|/g, '/'),
        bt.description.replace(/\|/g, '/'),
        formatStepsCell(bt.steps, targetOutput),
        bt.expectedResult.replace(/\|/g, '/'),
        bt.obtainedResult.replace(/\|/g, '/'),
        bt.testVersion.replace(/\|/g, '/'),
        bt.testStatus.replace(/\|/g, '/')
      ])
    : [['(Sin pruebas)', '-', '-', '-', '-', '-', '-']];
  const batteryTable = createTable(batteryHeaders, batteryRows, targetOutput);

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
        const isSingular = numImages === 1;
        const imageNoun = isSingular ? "imagen" : "imágenes";
        const verb = isSingular ? "Se ha adjuntado" : "Se han adjuntado";
        const consult = isSingular ? "consúltela" : "consúltelas";
        return `* Para el caso de prueba ${b(cleanId)}: ${verb} ${numImages} ${imageNoun}. Por favor, ${consult} en el documento Word adjunto o en el comentario aparte.`;
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


  // --- Logs Relevantes ---
  let logsSection = "";
  if (formData.logsRelevantes && formData.logsRelevantes.trim()) {
    if (targetOutput === 'jira') {
      // JIRA usa {code} para bloques de código
      logsSection = "{code:title=Logs}\n" + formData.logsRelevantes.trim() + "\n{code}";
    } else {
      // Markdown usa triple backticks
      logsSection = "```log\n" + formData.logsRelevantes.trim() + "\n```";
    }
  } else {
    logsSection = "(No se adjuntaron logs)";
  }

  // --- Resumen de Resultados ---
  const summaryHeaders = [b('Total de Pruebas'), b('Pruebas Exitosas'), b('Pruebas Fallidas'), b('Observaciones')];
  const observations = formData.summary.observations.replace(/\|/g, '/') || "(N/A)";
  const summaryRows = [[
    formData.summary.totalTests || "0",
    formData.summary.successfulTests || "0",
    formData.summary.failedTests || "0",
    observations
  ]];
  const summaryTable = createTable(summaryHeaders, summaryRows, targetOutput);

  // --- Incidencias ---
  let incidSection = "";
  if (formData.hasIncidences && formData.incidences.length) {
    const incidHeaders = [b('ID Prueba'), b('Descripción'), b('Impacto'), b('Estado')];
    const incidRows = formData.incidences.map(inc => [
      inc.id.trim().replace(/\|/g, '/'),
      inc.description.replace(/\|/g, '/'),
      inc.impact.replace(/\|/g, '/'),
      inc.status.replace(/\|/g, '/')
    ]);
    incidSection = createTable(incidHeaders, incidRows, targetOutput);
  } else {
    incidSection = "No se detectaron incidencias durante las pruebas.";
  }

  // --- Entorno de Pruebas ---
  const entornoPairs: [string, string][] = [];
  if (!hiddenFields.serverPruebas && formData.serverPruebas.trim()) { entornoPairs.push(["Servidor de Pruebas", formData.serverPruebas]); }
  if (!hiddenFields.ipMaquina && formData.ipMaquina.trim()) { entornoPairs.push(["IP Máquina", formData.ipMaquina]); }
  if (!hiddenFields.navegador && formData.navegador.trim()) { entornoPairs.push(["Navegador", formData.navegador]); }
  if (!hiddenFields.baseDatos && formData.baseDatos.trim()) { entornoPairs.push(["Base de Datos", formData.baseDatos]); }
  if (!hiddenFields.maquetaUtilizada && formData.maquetaUtilizada.trim()) { entornoPairs.push(["Maqueta Utilizada", formData.maquetaUtilizada]); }
  if (!hiddenFields.ambiente && formData.ambiente.trim()) { entornoPairs.push(["Ambiente", formData.ambiente]); }
  formData.customEnvFields.forEach((f) => { if (f.label.trim() && f.value.trim()) { entornoPairs.push([f.label.trim(), f.value.trim()]); } });
  const entornoList = entornoPairs.map(([k, v]) => `${b(k + ':')} ${v}`).join("\n");

  // --- Sección APP ---
  let appSection = "";
  if (formData.isApp) {
    const appHeaders = [b('Campo'), b('Detalle')];
    const appRows = [
      ['Endpoint', formData.endpoint?.replace(/\|/g, '/') || "(N/A)"],
      ['Sistema Operativo / Versión', formData.sistemaOperativo?.replace(/\|/g, '/') || "(N/A)"],
      ['Dispositivo de Pruebas', formData.dispositivoPruebas?.replace(/\|/g, '/') || "(N/A)"],
      ['Precondiciones', formData.precondiciones?.replace(/\|/g, '/') || "(N/A)"],
      ['Idioma', formData.idioma?.replace(/\|/g, '/') || "(N/A)"]
    ];
    const appTable = createTable(appHeaders, appRows, targetOutput);
    appSection = `📱 ${b('Validación de Aplicación')}\n\n${appTable}`;
  }

  // --- Montaje final ---
  return `
📌 ${b('Información General')}
${b('Título:')} ${parsed.title}
${b('Código de JIRA:')} ${formData.jiraCode}
${b('Fecha de Prueba:')} ${finalDate}
${b('Tester:')} ${formData.tester}
${b('Estado de la Prueba:')} ${formData.testStatus}

📌 ${b('Versiones del Sistema')}

${versionTable}

🖥️ ${b('Entorno de Pruebas')}

${entornoList.trim() ? entornoList : "(No se especificó entorno)"}
${appSection ? '\n' + appSection + '\n' : ''}
✅ ${b('Batería de Pruebas')}

${batteryTable}

💾 ${b('Datos de Prueba')}

${datosDePrueba}

📎 ${b('Evidencias')}

${evidenciaSection.trim()}

📝 ${b('Logs Relevantes')}

${logsSection}

📊 ${b('Resumen de Resultados')}

${summaryTable}

🛠️ ${b('Incidencias Detectadas')}

${incidSection}

📌 ${b('Conclusiones')}

${formData.conclusion.trim() || "(Sin conclusiones)"}
`;
}