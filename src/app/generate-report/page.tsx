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
// import formatReport, { FormData, HiddenFields } from "@/utils/formatReport"; // CORRECCIÓN: Eliminada la importación de la función formatReport
// Si FormData y HiddenFields se exportan desde formatReport.ts y las necesitas aquí, mantén:
// import type { FormData, HiddenFields } from "@/utils/formatReport"; 
// Pero como ya las tienes definidas abajo, esta línea completa puede ser eliminada.

/** Definimos la interfaz para ocultar campos de entorno. */
interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

// ... (resto de tus interfaces: BatteryTest, Incidence, Summary, FormData) ...
// Si estas interfaces (FormData, HiddenFields, etc.) están definidas aquí,
// entonces la importación de @/utils/formatReport no es necesaria en absoluto.

interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
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
  logsRelevantes?: string; // Añadido para que coincida con ReportOutput
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
  customEnvFields: Array<{ label: string; value: string }>;
}


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
    logsRelevantes: "", // Asegurar que esté inicializado
    customEnvFields: [],
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

  // const [report, setReport] = useState(""); // Ya no se necesita este estado

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
    // Ya no se llama a formatReport ni a setReport aquí
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
    // setReport(""); // Ya no se necesita
    setStep(1);
    setJiraCodeLocked(false);
  };

  const goBackToStep1 = () => {
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
            parsedData={parsedData} // Pasar parsedData
            formData={formData}         // Pasar formData
            hiddenFields={hiddenFields} // Pasar hiddenFields
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