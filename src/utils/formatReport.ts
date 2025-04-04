import { ParsedData } from "./parseJiraContent";

interface BatteryTest {
  id: string;
  description: string; // Asegurarnos de que existe esta propiedad
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testStatus: string;
}

interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

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
}

/**
 * Convierte multiline en bullet points para la columna de Pasos.
 */
function formatStepsCell(steps: string): string {
  const lines = steps.split(/\r?\n/).filter((line) => line.trim() !== "");
  return lines.map((line) => `- ${line}`).join(" \\n ");
}

export default function formatReport(parsed: ParsedData, formData: FormData): string {
  const finalDate = formData.date || new Date().toISOString().split("T")[0];

  // Sección Versiones
  let versionTable = "";
  formData.versions.forEach((v) => {
    versionTable += `| ${v.appName.trim()} | ${v.appVersion.trim()} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // Batería de Pruebas: Añadimos la columna "Descripción"
  let batteryTable = `| ID Prueba | Descripción | Pasos | Resultado Esperado | Resultado Obtenido | Estado |\n`;
  batteryTable += `| --------- | ----------- | ----- | ------------------ | ------------------ | ------ |\n`;
  if (formData.batteryTests.length > 0) {
    formData.batteryTests.forEach((bt) => {
      const stepsCell = formatStepsCell(bt.steps);
      batteryTable += `| ${bt.id} | ${bt.description} | ${stepsCell} | ${bt.expectedResult} | ${bt.obtainedResult} | ${bt.testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - | - |\n";
  }

  // Resumen
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${
    formData.summary.successfulTests || "0"
  } | ${formData.summary.failedTests || "0"} | ${
    formData.summary.observations || "(N/A)"
  } |\n`;

  // Incidencias
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

  // Reporte final
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

| **Parámetros de Configuración** | **Detalle**                  |
| ------------------------------- | ---------------------------- |
| Servidor de Pruebas            | ${formData.serverPruebas}    |
| IP Máquina                     | ${formData.ipMaquina}        |
| Navegador Utilizado            | ${formData.navegador}        |
| Base de Datos                  | ${formData.baseDatos}        |
| Maqueta Utilizada              | ${formData.maquetaUtilizada} |
| Ambiente                       | ${formData.ambiente}         |

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
