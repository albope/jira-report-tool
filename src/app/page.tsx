"use client";

import { useState } from "react";
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav"; // <-- Importa el nuevo Footer
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

export default function Home() {
  const [step, setStep] = useState(1);
  const [jiraContent, setJiraContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);

  // formData con fecha vacía por defecto
  const [formData, setFormData] = useState<FormData>({
    date: "",
    tester: "",
    testStatus: "",
    versions: [],
    serverPruebas: "",
    ipMaquina: "",
    usuario: "",
    contrasena: "",
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
    setFormData({
      date: "",
      tester: "",
      testStatus: "",
      versions: [],
      serverPruebas: "",
      ipMaquina: "",
      usuario: "",
      contrasena: "",
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
      {/* Header fijo */}
      <HeaderNav />

      {/* 
        Agregamos pt-20 para dejar espacio debajo del header fijo
        y evitar que el contenido se solape.
      */}
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
            report={report}
            onGoBackToStep1={goBackToStep1}
          />
        )}
        {step === 3 && (
          <ReportOutput
            report={report}
            onReset={handleReset}
            onGoBackToStep2={goBackToStep2}
          />
        )}

        {/* Botón flotante Feedback */}
        <Feedback />
      </main>

      {/* Footer al final de la página */}
      <FooterNav />
    </>
  );
}