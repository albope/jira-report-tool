// src/components/GenerateReportWorkflow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import parseJiraContent, { ParsedData } from "@/utils/parseJiraContent";

// INTERFACES (Copiadas de tu page.tsx original)
// Asegúrate de que estas definiciones coincidan con las usadas en tus otros componentes (StepTwoForm, ReportOutput)
// o considera moverlas a un archivo de tipos compartido.
interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
}

interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[]; // Para las imágenes de la batería de pruebas
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

export interface FormData { // Exportada si StepTwoForm u otros la necesitan directamente
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
// FIN DE INTERFACES

export default function GenerateReportWorkflow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const stepFromUrl = searchParams.get('step');
      return stepFromUrl ? parseInt(stepFromUrl, 10) : 1;
    }
    return 1;
  });

  const [jiraContent, setJiraContent] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('generateReportJiraContent') || "";
    }
    return "";
  });

  const [parsedData, setParsedData] = useState<ParsedData | null>(() => {
    if (typeof window !== 'undefined') {
      const savedParsedData = sessionStorage.getItem('generateReportParsedData');
      if (savedParsedData) {
        try {
          return JSON.parse(savedParsedData);
        } catch (e) {
          console.error("Error parsing parsedData from sessionStorage", e);
        }
      }
    }
    return null;
  });

  const [formData, setFormData] = useState<FormData>(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem('generateReportFormData');
      if (savedFormData) {
        try {
          return JSON.parse(savedFormData);
        } catch (e) {
          console.error("Error parsing formData from sessionStorage", e);
        }
      }
    }
    return {
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
      logsRelevantes: "",
      customEnvFields: [],
      isApp: false,
      endpoint: "",
      sistemaOperativo: "",
      dispositivoPruebas: "",
      precondiciones: "",
      idioma: "",
    };
  });

  const [jiraCodeLocked, setJiraCodeLocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('generateReportJiraCodeLocked') === 'true';
    }
    return false;
  });

  const [hiddenFields, setHiddenFields] = useState<HiddenFields>(() => {
    if (typeof window !== 'undefined') {
      const savedHiddenFields = sessionStorage.getItem('generateReportHiddenFields');
      if (savedHiddenFields) {
        try {
          return JSON.parse(savedHiddenFields);
        } catch (e) {
          console.error("Error parsing hiddenFields from sessionStorage", e);
        }
      }
    }
    return {
      serverPruebas: false, ipMaquina: false, navegador: false,
      baseDatos: false, maquetaUtilizada: false, ambiente: false,
    };
  });

  // Efecto para inicializar el paso y validar datos al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stepFromUrl = searchParams.get('step');
      const currentStepInUrl = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;

      // Cargar datos de sessionStorage si no se hizo en useState (por si Suspense retrasa la primera lectura de searchParams)
      const savedJiraContent = sessionStorage.getItem('generateReportJiraContent');
      if (savedJiraContent && !jiraContent) setJiraContent(savedJiraContent);

      const savedParsedDataString = sessionStorage.getItem('generateReportParsedData');
      if (savedParsedDataString && !parsedData) {
        try {
          setParsedData(JSON.parse(savedParsedDataString));
        } catch (e) { console.error("Error re-parsing parsedData", e); }
      }
      // Similar para formData, hiddenFields, jiraCodeLocked si es necesario, aunque useState ya lo hace.

      if (currentStepInUrl === 2 && !parsedData && !savedParsedDataString) {
        updateStepUrl(1);
      } else if (currentStepInUrl === 3 && (!parsedData && !savedParsedDataString)) { // Simplificado, formData debería existir
        updateStepUrl(1);
      } else {
        setStep(currentStepInUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ejecutar solo una vez al montar para leer la URL inicial y sessionStorage

  // Guardar estados en sessionStorage cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('generateReportFormData', JSON.stringify(formData));
      sessionStorage.setItem('generateReportHiddenFields', JSON.stringify(hiddenFields));
      sessionStorage.setItem('generateReportJiraCodeLocked', String(jiraCodeLocked));
      if (jiraContent) sessionStorage.setItem('generateReportJiraContent', jiraContent);
      else sessionStorage.removeItem('generateReportJiraContent'); // Limpiar si está vacío
      if (parsedData) sessionStorage.setItem('generateReportParsedData', JSON.stringify(parsedData));
      else sessionStorage.removeItem('generateReportParsedData'); // Limpiar si es null
    }
  }, [formData, hiddenFields, jiraCodeLocked, jiraContent, parsedData]);

  // Función para actualizar el paso y la URL
  const updateStepUrl = (newStep: number) => {
    setStep(newStep);
    router.push(`/generate-report?step=${newStep}`, { scroll: false });
  };

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
    updateStepUrl(2);
  };

  const handleGenerateReport = () => {
    if (!parsedData) {
      alert("No hay datos parseados para generar el reporte. Vuelve al Paso 1.");
      return;
    }
    updateStepUrl(3);
  };

  const handleReset = () => {
    setJiraContent("");
    setParsedData(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('generateReportFormData');
      sessionStorage.removeItem('generateReportHiddenFields');
      sessionStorage.removeItem('generateReportJiraCodeLocked');
      sessionStorage.removeItem('generateReportJiraContent');
      sessionStorage.removeItem('generateReportParsedData');
    }
    setFormData({
      jiraCode: "", date: new Date().toISOString().split("T")[0], tester: "",
      testStatus: "", versions: [], serverPruebas: "", ipMaquina: "",
      navegador: "", baseDatos: "", maquetaUtilizada: "", ambiente: "",
      batteryTests: [],
      summary: { totalTests: "", successfulTests: "", failedTests: "", observations: "" },
      incidences: [], hasIncidences: false, conclusion: "", datosDePrueba: "",
      logsRelevantes: "", customEnvFields: [], isApp: false, endpoint: "",
      sistemaOperativo: "", dispositivoPruebas: "", precondiciones: "", idioma: "",
    });
    setHiddenFields({
      serverPruebas: false, ipMaquina: false, navegador: false,
      baseDatos: false, maquetaUtilizada: false, ambiente: false,
    });
    setJiraCodeLocked(false);
    updateStepUrl(1);
  };

  const goBackToStep1 = () => {
    updateStepUrl(1);
  };
  const goBackToStep2 = () => {
    updateStepUrl(2);
  };

  // Efecto para escuchar cambios en la URL (botones de atrás/adelante del navegador)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Asegurar que se ejecuta en el cliente

    const stepFromUrl = searchParams.get('step');
    const currentStepInUrl = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;

    if (currentStepInUrl !== step) {
      // Cargar datos necesarios de sessionStorage para validar la transición
      const sessionParsedDataString = sessionStorage.getItem('generateReportParsedData');
      let sessionParsedDataObj = null;
      if (sessionParsedDataString) {
        try {
          sessionParsedDataObj = JSON.parse(sessionParsedDataString);

          // eslint-disable-next-line @typescript-eslint/no-unused-vars 
        } catch (_e) {/* ignore */ }
      }

      const sessionFormDataString = sessionStorage.getItem('generateReportFormData');
      let sessionFormDataObj = null;
      if (sessionFormDataString) {
        try { sessionFormDataObj = JSON.parse(sessionFormDataString); }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (_e) {/* ignore */ }
      }


      if (currentStepInUrl === 1) {
        setStep(1);
      } else if (currentStepInUrl === 2) {
        if (parsedData || sessionParsedDataObj) {
          setStep(2);
          if (!parsedData && sessionParsedDataObj) setParsedData(sessionParsedDataObj); // Restaurar si es necesario
        } else {
          updateStepUrl(1); // No hay datos para el paso 2, volver al 1
        }
      } else if (currentStepInUrl === 3) {
        if ((parsedData || sessionParsedDataObj) && (formData?.jiraCode || sessionFormDataObj?.jiraCode)) { // formData siempre debería existir
          setStep(3);
          if (!parsedData && sessionParsedDataObj) setParsedData(sessionParsedDataObj); // Restaurar si es necesario
          // formData se actualiza a través de su propio useEffect y useState
        } else {
          updateStepUrl(1); // No hay datos para el paso 3, volver al 1
        }
      } else {
        // Si la URL tiene un paso inválido, ir al paso 1 por defecto
        updateStepUrl(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // Solo depende de searchParams para reaccionar a cambios de URL

  return (
    <>
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
      {step === 2 && !parsedData && (
        <div className="text-center p-10">
          <p>Faltan datos para el paso 2. Por favor, completa el paso 1.</p>
          <button onClick={goBackToStep1} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Volver al Paso 1
          </button>
        </div>
      )}

      {step === 3 && parsedData && (
        <ReportOutput
          parsedData={parsedData}
          formData={formData}
          hiddenFields={hiddenFields}
          onReset={handleReset}
          onGoBackToStep2={goBackToStep2}
          jiraCode={formData.jiraCode}
        />
      )}
      {step === 3 && !parsedData && (
        <div className="text-center p-10">
          <p>Faltan datos para el paso 3. Por favor, completa los pasos anteriores.</p>
          <button onClick={goBackToStep1} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
            Volver al Paso 1
          </button>
        </div>
      )}
      <Feedback />
    </>
  );
}