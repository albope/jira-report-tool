// src/app/generate-report/page.tsx
"use client";

import { useState, useEffect } from "react"; // Agrega useEffect
import { useRouter, useSearchParams } from "next/navigation"; // Importa useRouter y useSearchParams
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import parseJiraContent, { ParsedData } from "@/utils/parseJiraContent";
// Asegúrate de que tus interfaces (FormData, HiddenFields, etc.) estén definidas o importadas
// Por simplicidad, asumiré que están como antes.

// ... (tus interfaces: HiddenFields, BatteryTest, Incidence, Summary, FormData) ...
// Estas interfaces deben estar aquí o importadas desde @/utils/formatReport u otro archivo de tipos
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
  images?: string[];
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
  logsRelevantes?: string;
  isApp?: boolean;
  endpoint?: string;
  sistemaOperativo?: string;
  dispositivoPruebas?: string;
  precondiciones?: string;
  idioma?: string;
  customEnvFields: Array<{ label: string; value: string }>;
}


export default function GenerateReportPage() { // Renombrado para claridad si es necesario
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estado para el paso actual, inicializado desde la URL o por defecto a 1
  const [step, setStep] = useState(() => {
    const stepFromUrl = searchParams.get('step');
    return stepFromUrl ? parseInt(stepFromUrl, 10) : 1;
  });

  const [jiraContent, setJiraContent] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [formData, setFormData] = useState<FormData>(() => {
    // Intenta cargar formData desde sessionStorage al iniciar
    if (typeof window !== 'undefined') {
      const savedFormData = sessionStorage.getItem('generateReportFormData');
      if (savedFormData) {
        try {
          return JSON.parse(savedFormData);
        } catch (e) {
          console.error("Error parsing formData from sessionStorage", e);
          // sessionStorage.removeItem('generateReportFormData'); // Opcional: limpiar si está corrupto
        }
      }
    }
    return { // Estado inicial por defecto si no hay nada guardado
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
  
  // Cargar parsedData y jiraContent desde sessionStorage al montar si es relevante para el paso actual
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStep = searchParams.get('step');
      const currentStep = savedStep ? parseInt(savedStep, 10) : 1;

      const savedJiraContent = sessionStorage.getItem('generateReportJiraContent');
      if (savedJiraContent) {
        setJiraContent(savedJiraContent);
      }

      const savedParsedData = sessionStorage.getItem('generateReportParsedData');
      if (savedParsedData) {
        try {
          setParsedData(JSON.parse(savedParsedData));
        } catch (e) {
          console.error("Error parsing parsedData from sessionStorage", e);
        }
      }
      
      // Forzar el estado del paso desde la URL al cargar la página
      // y validar que los datos necesarios para ese paso existan
      if (currentStep === 2 && !savedParsedData) {
        updateStepUrl(1); // Si no hay parsedData, volver al paso 1
      } else if (currentStep === 3 && (!savedParsedData || !sessionStorage.getItem('generateReportFormData'))) {
        updateStepUrl(1); // Si no hay datos para el paso 3, volver al paso 1
      } else {
         setStep(currentStep);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta al montar para leer la URL inicial y sessionStorage


  // Guardar formData y otros estados en sessionStorage cuando cambien
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('generateReportFormData', JSON.stringify(formData));
      sessionStorage.setItem('generateReportHiddenFields', JSON.stringify(hiddenFields));
      sessionStorage.setItem('generateReportJiraCodeLocked', String(jiraCodeLocked));
      if (jiraContent) sessionStorage.setItem('generateReportJiraContent', jiraContent);
      if (parsedData) sessionStorage.setItem('generateReportParsedData', JSON.stringify(parsedData));
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
      // Opcionalmente, forzar el regreso al paso 1 si falta parsedData
      // updateStepUrl(1); 
      return;
    }
    updateStepUrl(3);
  };

  const handleReset = () => {
    setJiraContent("");
    setParsedData(null);
    // Limpiar sessionStorage también
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('generateReportFormData');
      sessionStorage.removeItem('generateReportHiddenFields');
      sessionStorage.removeItem('generateReportJiraCodeLocked');
      sessionStorage.removeItem('generateReportJiraContent');
      sessionStorage.removeItem('generateReportParsedData');
    }
    // Re-inicializar formData y hiddenFields a sus valores por defecto
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
    const stepFromUrl = searchParams.get('step');
    const currentStepInUrl = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;
    if (currentStepInUrl !== step) {
        // Validar si se puede ir a ese paso
        if (currentStepInUrl === 1) {
            setStep(1);
        } else if (currentStepInUrl === 2 && parsedData) {
            setStep(2);
        } else if (currentStepInUrl === 3 && parsedData && formData) { // formData siempre debería existir
            setStep(3);
        } else {
            // Si no se puede ir al paso de la URL (ej. falta de datos),
            // podrías redirigir al paso 1 o al paso actual válido.
            // Por ahora, simplemente actualizamos el estado interno si es válido.
            // Si se vuelve al paso 2 desde el 3, y no hay parsedData, el render condicional lo manejará.
             if (currentStepInUrl === 2 && !parsedData) {
                router.push('/generate-report?step=1', { scroll: false }); // Vuelve al paso 1
                setStep(1);
            } else if (currentStepInUrl === 3 && (!parsedData || !formData.jiraCode)) { // Asumiendo que jiraCode en formData es vital
                router.push('/generate-report?step=1', { scroll: false }); // Vuelve al paso 1
                setStep(1);
            }
            else {
                setStep(currentStepInUrl);
            }
        }
    }
  }, [searchParams, step, parsedData, formData, router]);


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

        {step === 2 && parsedData && ( // Asegúrate que parsedData exista para el paso 2
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
         {/* Si estás en el paso 2 pero no hay parsedData, podrías mostrar un mensaje o redirigir */}
        {step === 2 && !parsedData && (
          <div className="text-center p-10">
            <p>Faltan datos para el paso 2. Por favor, completa el paso 1.</p>
            <button onClick={goBackToStep1} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
              Volver al Paso 1
            </button>
          </div>
        )}


        {step === 3 && parsedData && ( // Asegúrate que parsedData exista para el paso 3
          <ReportOutput
            parsedData={parsedData} 
            formData={formData}    
            hiddenFields={hiddenFields} 
            onReset={handleReset}
            onGoBackToStep2={goBackToStep2}
            jiraCode={formData.jiraCode}
          />
        )}
        {/* Si estás en el paso 3 pero no hay parsedData, podrías mostrar un mensaje o redirigir */}
        {step === 3 && !parsedData && (
           <div className="text-center p-10">
            <p>Faltan datos para el paso 3. Por favor, completa los pasos anteriores.</p>
            <button onClick={goBackToStep1} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
              Volver al Paso 1
            </button>
          </div>
        )}
        <Feedback />
      </main>
      <FooterNav />
    </>
  );
}