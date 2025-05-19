// src/app/generate-report/page.tsx
"use client";

import { useState } from "react";
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import parseJiraContent, { ParsedData } from "@/utils/parseJiraContent";
// Asegúrate que formatReport y los tipos FormData, HiddenFields estén correctamente exportados e importados
import formatReport, { FormData, HiddenFields } from "@/utils/formatReport"; 

// Las interfaces BatteryTest, Incidence, Summary se mantienen igual
// pero no son directamente usadas por este componente padre, sino por FormData.
// Si FormData está correctamente definida e importada (o definida aquí), está bien.

// Interfaz FormData (la mantengo aquí por si no la importas directamente)
// Si la importas desde formatReport.ts, puedes eliminar esta definición duplicada.
// interface FormData {
//   jiraCode: string;
//   date: string;
//   tester: string;
//   // ... todos los demás campos de FormData
//   logsRelevantes?: string; // Asegúrate que este campo esté en tu definición de FormData
//   customEnvFields: Array<{ label: string; value: string }>;
// }


export default function Home() {
  const [step, setStep] = useState(1);
  const [jiraContent, setJiraContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    jiraCode: "",
    date: new Date().toISOString().split("T")[0],
    tester: "",
    testStatus: "",
    versions: [],
    serverPruebas: "",
    ipMaquina: "",
    navegador: "",
    baseDatos: "",
    maquetaUtilizada: "",
    ambiente: "",
    batteryTests: [],
    summary: {
      totalTests: "",
      successfulTests: "",
      failedTests: "",
      observations: "",
    },
    incidences: [],
    hasIncidences: false,
    conclusion: "",
    datosDePrueba: "",
    logsRelevantes: "", // Inicializar si es parte de FormData
    customEnvFields: [],
    // Inicializar campos de APP si son parte de FormData
    isApp: false,
    endpoint: "",
    sistemaOperativo: "",
    dispositivoPruebas: "",
    precondiciones: "",
    idioma: "",
  });

  const [jiraCodeLocked, setJiraCodeLocked] = useState(false);

  const [hiddenFields, setHiddenFields] = useState<HiddenFields>({
    serverPruebas: false,
    ipMaquina: false,
    navegador: false,
    baseDatos: false,
    maquetaUtilizada: false,
    ambiente: false,
  });

  // El estado 'report' ya no es necesario si ReportOutput genera su propia preview.
  // const [report, setReport] = useState(""); 

  const handleParseJira = (jiraKey?: string) => {
    const result = parseJiraContent(jiraContent);
    setParsedData(result);
    if (jiraKey) {
      setFormData((prev) => ({
        ...prev,
        jiraCode: jiraKey,
      }));
      setJiraCodeLocked(true);
    } else {
      setJiraCodeLocked(false);
    }
    setStep(2);
  };

  const handleGenerateReport = () => {
    if (!parsedData) {
      alert("No hay datos parseados para generar el reporte. Vuelve al Paso 1.");
      return;
    }
    // Ya no necesitamos generar y pasar el 'report' string a ReportOutput.
    // ReportOutput tomará parsedData, formData, hiddenFields y generará
    // la vista previa internamente.
    // const finalReport = formatReport(parsedData, formData, hiddenFields, 'jira'); // Ya no es necesario aquí
    // setReport(finalReport); // Ya no es necesario aquí
    setStep(3);
  };

  const handleReset = () => {
    setJiraContent("");
    setParsedData(null);
    setFormData({
      jiraCode: "",
      date: new Date().toISOString().split("T")[0],
      tester: "",
      testStatus: "",
      versions: [],
      serverPruebas: "",
      ipMaquina: "",
      navegador: "",
      baseDatos: "",
      maquetaUtilizada: "",
      ambiente: "",
      batteryTests: [],
      summary: { totalTests: "", successfulTests: "", failedTests: "", observations: "" },
      incidences: [],
      hasIncidences: false,
      conclusion: "",
      datosDePrueba: "",
      logsRelevantes: "",
      customEnvFields: [],
      isApp: false,
      endpoint: "",
      sistemaOperativo: "",
      dispositivoPruebas: "",
      precondiciones: "",
      idioma: "",
    });
    setHiddenFields({
      serverPruebas: false, ipMaquina: false, navegador: false,
      baseDatos: false, maquetaUtilizada: false, ambiente: false,
    });
    // setReport(""); // Ya no es necesario
    setStep(1);
    setJiraCodeLocked(false);
  };

  const goBackToStep1 = () => {
    // Al volver al paso 1, podríamos considerar limpiar parsedData
    // si la intención es empezar de nuevo con el parseo.
    // setParsedData(null); // Opcional
    setStep(1);
  }
  const goBackToStep2 = () => setStep(2);

  return (
    <>
      <HeaderNav />
      <main className="pt-20 min-h-screen bg-gray-50 relative">
        {step === 1 && (
          <StepOnePaste
            jiraContent={jiraContent}
            setJiraContent={setJiraContent}
            onParse={handleParseJira}
          />
        )}

        {step === 2 && parsedData && (
          <StepTwoForm
            parsedData={parsedData}
            formData={formData}
            setFormData={setFormData}
            hiddenFields={hiddenFields}
            setHiddenFields={setHiddenFields}
            onGenerate={handleGenerateReport}
            onReset={handleReset}
            onGoBackToStep1={goBackToStep1}
            jiraCodeLocked={jiraCodeLocked}
          />
        )}

        {step === 3 && (
          <ReportOutput
            // La prop 'report' se elimina
            parsedData={parsedData}      // Pasar parsedData
            formData={formData}          // Pasar formData
            hiddenFields={hiddenFields}  // Pasar hiddenFields
            onReset={handleReset}
            onGoBackToStep2={goBackToStep2}
            jiraCode={formData.jiraCode}
          />
        )}
        <Feedback />
      </main>
      <FooterNav />
    </>
  );
}