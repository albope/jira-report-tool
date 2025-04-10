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

/** FormData */
interface FormData {
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

  // APP
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
}

/** Campos ocultables */
interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

/** Helper para formatear pasos multiline en bullet points */
function formatStepsCell(steps: string): string {
  const lines = steps.split(/\r?\n/).filter((line) => line.trim() !== "");
  return lines.map((line) => `- ${line}`).join(" \\n ");
}

/**
 * Recibimos hiddenFields y omitimos del reporte
 * los campos que estén ocultos en hiddenFields.
 */
export default function formatReport(
  parsed: ParsedData,
  formData: FormData,
  hiddenFields: HiddenFields
): string {
  const finalDate = formData.date || new Date().toISOString().split("T")[0];

  // 1) Versiones
  let versionTable = "";
  formData.versions.forEach((v) => {
    versionTable += `| ${v.appName.trim()} | ${v.appVersion.trim()} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // 2) Batería de Pruebas
  let batteryTable = `| ID Prueba | Descripción | Pasos | Resultado Esperado | Resultado Obtenido | Versión | Estado |\n`;
  batteryTable += `| --------- | ----------- | ----- | ------------------ | ------------------ | ------- | ------ |\n`;
  if (formData.batteryTests.length > 0) {
    formData.batteryTests.forEach((bt) => {
      const stepsCell = formatStepsCell(bt.steps);
      batteryTable += `| ${bt.id} | ${bt.description} | ${stepsCell} | ${bt.expectedResult} | ${bt.obtainedResult} | ${bt.testVersion} | ${bt.testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - | - | - |\n";
  }

  // 3) Resumen de Resultados
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${
    formData.summary.successfulTests || "0"
  } | ${formData.summary.failedTests || "0"} | ${
    formData.summary.observations || "(N/A)"
  } |\n`;

  // 4) Incidencias
  let incidencesSection = "";
  if (formData.hasIncidences && formData.incidences.length > 0) {
    incidencesSection += `| **ID Prueba** | **Descripción de la Incidencia** | **Impacto** | **Estado** |\n`;
    incidencesSection += `| ------------- | ------------------------------- | ----------- | ---------- |\n`;
    formData.incidences.forEach((inc) => {
      incidencesSection += `| ${inc.id} | ${inc.description} | ${inc.impact} | ${inc.status} |\n`;
    });
  } else {
    incidencesSection = "No se detectaron incidencias durante las pruebas.";
  }

  // 5) Entorno => Listado en negrita “campo: valor”, para que Word no lo interprete como pseudo tabla
  const entornoPairs: Array<[string, string]> = [];

  if (!hiddenFields.serverPruebas && formData.serverPruebas.trim() !== "") {
    entornoPairs.push(["Servidor de Pruebas", formData.serverPruebas]);
  }
  if (!hiddenFields.ipMaquina && formData.ipMaquina.trim() !== "") {
    entornoPairs.push(["IP Máquina", formData.ipMaquina]);
  }
  if (!hiddenFields.navegador && formData.navegador.trim() !== "") {
    entornoPairs.push(["Navegador Utilizado", formData.navegador]);
  }
  if (!hiddenFields.baseDatos && formData.baseDatos.trim() !== "") {
    entornoPairs.push(["Base de Datos", formData.baseDatos]);
  }
  if (!hiddenFields.maquetaUtilizada && formData.maquetaUtilizada.trim() !== "") {
    entornoPairs.push(["Maqueta Utilizada", formData.maquetaUtilizada]);
  }
  if (!hiddenFields.ambiente && formData.ambiente.trim() !== "") {
    entornoPairs.push(["Ambiente", formData.ambiente]);
  }

  let entornoList = "";
  if (entornoPairs.length > 0) {
    entornoList = entornoPairs
      .map(([key, val]) => `**${key.trim()}:** ${val.trim()}`)
      .join("\n");
  } else {
    entornoList = "(Sin datos de entorno)";
  }

  // 6) Sección APP si isApp === true
  let appSection = "";
  if (formData.isApp) {
    appSection = `
📱 **Validación de Aplicación**

| **Campo**                    | **Detalle**                               |
| --------------------------- | ----------------------------------------- |
| Endpoint                    | ${formData.endpoint || "(N/A)"}           |
| Sistema Operativo / Versión | ${formData.sistemaOperativo || "(N/A)"}   |
| Dispositivo de Pruebas      | ${formData.dispositivoPruebas || "(N/A)"} |
| Precondiciones              | ${formData.precondiciones || "(N/A)"}     |
| Idioma                      | ${formData.idioma || "(N/A)"}             |
`;
  }

  // 7) Reporte final => Entorno se muestra como “campo: valor” en negrita
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
${formData.datosDePrueba?.trim() || "(Sin datos de prueba)"}

📎 **Evidencias**
"Adjuntar capturas de pantalla relevantes"

📝 **Logs Relevantes**
"Adjuntar logs del sistema o registros relevantes"

📊 **Resumen de Resultados**

${summaryTable.trim()}

🛠️ **Incidencias Detectadas**
${incidencesSection}

📌 **Conclusiones**
${formData.conclusion || "(Sin conclusiones)"}
`;
}