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

interface BatteryTest {
  id: string;
  description: string;
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

/**
 * NUEVA estructura sin usuario/contrasena.
 * Se añade jiraCode como campo obligatorio.
 */
interface FormData {
  jiraCode: string; // campo nuevo para "código JIRA"
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
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [jiraContent, setJiraContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  // formData con fecha vacía y jiraCode también vacío por defecto
  const [formData, setFormData] = useState<FormData>({
    jiraCode: "", // Nuevo campo
    date: "",
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
  });

  const [report, setReport] = useState("");

  const handleParseJira = () => {
    const result = parseJiraContent(jiraContent);
    setParsedData(result);
    setStep(2);
  };

  const handleGenerateReport = () => {
    if (!parsedData) return;
    const finalReport = formatReport(parsedData, formData);
    setReport(finalReport);
    setStep(3);
  };

  const handleReset = () => {
    setJiraContent("");
    setParsedData(null);
    // Se limpian los campos, incluida jiraCode
    setFormData({
      jiraCode: "",
      date: "",
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
            /** Pasamos jiraCode para renombrar Word */
            jiraCode={formData.jiraCode}
          />
        )}

        <Feedback />
      </main>

      <FooterNav />
    </>
  );
}