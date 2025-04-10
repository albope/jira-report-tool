"use client";

import { useState } from "react";
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import parseJiraContent, { ParsedData } from "@/utils/parseJiraContent";
import formatReport from "@/utils/formatReport";

/** Definimos la interfaz para ocultar campos de entorno. */
interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

/** Tipos auxiliares para tu FormData, etc. */
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
  // Campos APP
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [jiraContent, setJiraContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  // Estado principal de FormData
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
  });

  // Estado para saber qué campos de entorno están ocultos (true = oculto)
  const [hiddenFields, setHiddenFields] = useState<HiddenFields>({
    serverPruebas: false,
    ipMaquina: false,
    navegador: false,
    baseDatos: false,
    maquetaUtilizada: false,
    ambiente: false,
  });

  const [report, setReport] = useState("");

  // Paso 1 → 2
  const handleParseJira = () => {
    const result = parseJiraContent(jiraContent);
    setParsedData(result);
    setStep(2);
  };

  // Generar reporte → Paso 3
  const handleGenerateReport = () => {
    if (!parsedData) return;
    // Pasamos hiddenFields al formatReport
    const finalReport = formatReport(parsedData, formData, hiddenFields);
    setReport(finalReport);
    setStep(3);
  };

  // Reset total
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
    });

    // También reseteamos hiddenFields
    setHiddenFields({
      serverPruebas: false,
      ipMaquina: false,
      navegador: false,
      baseDatos: false,
      maquetaUtilizada: false,
      ambiente: false,
    });

    setReport("");
    setStep(1);
  };

  const goBackToStep1 = () => setStep(1);
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

            /** Pasamos hiddenFields y setHiddenFields a StepTwoForm */
            hiddenFields={hiddenFields}
            setHiddenFields={setHiddenFields}

            onGenerate={handleGenerateReport}
            onReset={handleReset}
            onGoBackToStep1={goBackToStep1}
          />
        )}

        {step === 3 && (
          <ReportOutput
            report={report}
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