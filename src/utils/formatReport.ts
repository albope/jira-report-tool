// src/utils/formatReport.ts

import { ParsedData } from "./parseJiraContent";

interface BatteryTest {
  id: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testStatus: string;
  // OJO: Eliminado 'description' para que coincida con el formulario
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
  date: string;
  tester: string;
  testStatus: string;
  versions: Array<{ appName: string; appVersion: string }>;
  serverPruebas: string;
  ipMaquina: string;
  usuario: string;
  contrasena: string;
  navegador: string;
  baseDatos: string;
  maquetaUtilizada: string;
  ambiente: string;
  batteryTests: BatteryTest[];
  summary: Summary;
  incidences: Incidence[];
  hasIncidences: boolean;
  conclusion: string;
}

/**
 * Convierte cada línea de `steps` en un ítem enumerado,
 * separado por '\\n' para que se mantenga multiline en la misma celda Markdown.
 */
function formatStepsCell(steps: string): string {
  const lines = steps.split(/\r?\n/).filter((line) => line.trim() !== "");
  // Anteponemos "- " a cada línea y unimos con " \\n "
  return lines.map((line) => `- ${line}`).join(" \\n ");
}

export default function formatReport(parsed: ParsedData, formData: FormData): string {
  // Fecha por defecto si el usuario no eligió ninguna
  const finalDate = formData.date || new Date().toISOString().split("T")[0];

  // -- Sección de Versiones --
  let versionTable = "";
  formData.versions.forEach((v) => {
    versionTable += `| ${v.appName.trim()} | ${v.appVersion.trim()} |\n`;
  });
  if (!versionTable) {
    versionTable = "| (No hay versiones) | (N/A) |\n";
  }

  // -- Batería de Pruebas --
  // Eliminamos la columna "Descripción"
  let batteryTable = `| ID Prueba | Pasos | Resultado Esperado | Resultado Obtenido | Estado |\n`;
  batteryTable += `| --------- | ----- | ------------------ | ------------------ | ------ |\n`;

  if (formData.batteryTests.length > 0) {
    formData.batteryTests.forEach((bt) => {
      const stepsCell = formatStepsCell(bt.steps);
      batteryTable += `| ${bt.id} | ${stepsCell} | ${bt.expectedResult} | ${bt.obtainedResult} | ${bt.testStatus} |\n`;
    });
  } else {
    batteryTable += "| (Sin pruebas) | - | - | - | - |\n";
  }

  // -- Resumen de Resultados --
  let summaryTable = `| **Total de Pruebas** | **Pruebas Exitosas** | **Pruebas Fallidas** | **Observaciones** |\n`;
  summaryTable += `| -------------------- | -------------------- | -------------------- | ----------------- |\n`;
  summaryTable += `| ${formData.summary.totalTests || "0"} | ${
    formData.summary.successfulTests || "0"
  } | ${formData.summary.failedTests || "0"} | ${
    formData.summary.observations || "(N/A)"
  } |\n`;

  // -- Incidencias --
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

  // -- Construcción final del reporte --
  // Aseguramos DOBLE salto de línea antes de cada tabla para que `markdownToDocx` lo reconozca.
  return `
📌 **Información General**
**Título:** ${parsed.title}
**Fecha de Prueba:** ${finalDate}
**Tester:** ${formData.tester}
**Estado de la Prueba:** ${formData.testStatus}

📌 **Versiones del Sistema**

| **Aplicativo** | **Versión** |
| -------------- | ----------- |
${versionTable.trim()}

🖥️ **Entorno de Pruebas**

| **Parámetros de Configuración** | **Detalle**                     |
| ------------------------------- | ------------------------------- |
| Servidor de Pruebas            | ${formData.serverPruebas}       |
| IP Máquina                     | ${formData.ipMaquina}           |
| Usuario                        | ${formData.usuario}             |
| Contraseña                     | ${formData.contrasena}          |
| Navegador Utilizado            | ${formData.navegador}           |
| Base de Datos                  | ${formData.baseDatos}           |
| Maqueta Utilizada              | ${formData.maquetaUtilizada}    |
| Ambiente                       | ${formData.ambiente}            |

✅ **Batería de Pruebas**

${batteryTable.trim()}

📎 **Evidencias**
📷 **Capturas de Pantalla**
💡 "Aquí se deben adjuntar capturas de pantalla relevantes sobre la ejecución de la prueba."

📝 **Logs Relevantes**
💡 "Aquí se deben adjuntar logs del sistema o registros relevantes para la validación de la prueba."

📊 **Resumen de Resultados**

${summaryTable.trim()}

🛠️ **Incidencias Detectadas**
${incidencesSection}

📌 **Conclusiones**
${formData.conclusion || "(Sin conclusiones)"}
`;
}