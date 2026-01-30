// src/components/GenerateReportWorkflow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import StepOnePaste from "@/components/StepOnePaste";
import StepTwoForm from "@/components/StepTwoForm";
import ReportOutput from "@/components/ReportOutput";
import Feedback from "@/components/Feedback";
import parseJiraContent, { ParsedData } from "@/utils/parseJiraContent";
import { useToast } from "@/components/ui/Toast";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "@/components/ui/AutoSaveIndicator";
import { PageLoadingSkeleton } from "@/components/ui/Skeleton";

// INTERFACES
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

export interface FormData {
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

const defaultFormData: FormData = {
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
};

const defaultHiddenFields: HiddenFields = {
  serverPruebas: false,
  ipMaquina: false,
  navegador: false,
  baseDatos: false,
  maquetaUtilizada: false,
  ambiente: false,
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pageTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export default function GenerateReportWorkflow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);

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
    return defaultFormData;
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
    return defaultHiddenFields;
  });

  // Auto-save hook
  const autoSave = useAutoSave({
    key: 'jira-report-autosave',
    data: { formData, hiddenFields, jiraContent, parsedData },
    debounceMs: 2000,
    enabled: step === 2,
  });

  // Initialize loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize step from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stepFromUrl = searchParams.get('step');
      const currentStepInUrl = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;

      const savedJiraContent = sessionStorage.getItem('generateReportJiraContent');
      if (savedJiraContent && !jiraContent) setJiraContent(savedJiraContent);

      const savedParsedDataString = sessionStorage.getItem('generateReportParsedData');
      if (savedParsedDataString && !parsedData) {
        try {
          setParsedData(JSON.parse(savedParsedDataString));
        } catch (e) {
          console.error("Error re-parsing parsedData", e);
        }
      }

      if (currentStepInUrl === 2 && !parsedData && !savedParsedDataString) {
        updateStepUrl(1);
      } else if (currentStepInUrl === 3 && (!parsedData && !savedParsedDataString)) {
        updateStepUrl(1);
      } else {
        setStep(currentStepInUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to sessionStorage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('generateReportFormData', JSON.stringify(formData));
      sessionStorage.setItem('generateReportHiddenFields', JSON.stringify(hiddenFields));
      sessionStorage.setItem('generateReportJiraCodeLocked', String(jiraCodeLocked));
      if (jiraContent) sessionStorage.setItem('generateReportJiraContent', jiraContent);
      else sessionStorage.removeItem('generateReportJiraContent');
      if (parsedData) sessionStorage.setItem('generateReportParsedData', JSON.stringify(parsedData));
      else sessionStorage.removeItem('generateReportParsedData');
    }
  }, [formData, hiddenFields, jiraCodeLocked, jiraContent, parsedData]);

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
    toast.success("Contenido procesado", "Puedes continuar completando el formulario.");
    updateStepUrl(2);
  };

  const handleGenerateReport = () => {
    if (!parsedData) {
      toast.error("Error", "No hay datos parseados para generar el reporte. Vuelve al Paso 1.");
      return;
    }
    toast.info("Generando reporte", "Tu reporte está listo para visualizar.");
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
      localStorage.removeItem('jira-report-autosave');
    }
    setFormData(defaultFormData);
    setHiddenFields(defaultHiddenFields);
    setJiraCodeLocked(false);
    toast.success("Formulario reiniciado", "Puedes comenzar de nuevo.");
    updateStepUrl(1);
  };

  const goBackToStep1 = () => {
    updateStepUrl(1);
  };

  const goBackToStep2 = () => {
    updateStepUrl(2);
  };

  // Listen to URL changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stepFromUrl = searchParams.get('step');
    const currentStepInUrl = stepFromUrl ? parseInt(stepFromUrl, 10) : 1;

    if (currentStepInUrl !== step) {
      const sessionParsedDataString = sessionStorage.getItem('generateReportParsedData');
      let sessionParsedDataObj = null;
      if (sessionParsedDataString) {
        try {
          sessionParsedDataObj = JSON.parse(sessionParsedDataString);
        } catch {
          /* ignore */
        }
      }

      const sessionFormDataString = sessionStorage.getItem('generateReportFormData');
      let sessionFormDataObj = null;
      if (sessionFormDataString) {
        try {
          sessionFormDataObj = JSON.parse(sessionFormDataString);
        } catch {
          /* ignore */
        }
      }

      if (currentStepInUrl === 1) {
        setStep(1);
      } else if (currentStepInUrl === 2) {
        if (parsedData || sessionParsedDataObj) {
          setStep(2);
          if (!parsedData && sessionParsedDataObj) setParsedData(sessionParsedDataObj);
        } else {
          updateStepUrl(1);
        }
      } else if (currentStepInUrl === 3) {
        if ((parsedData || sessionParsedDataObj) && (formData?.jiraCode || sessionFormDataObj?.jiraCode)) {
          setStep(3);
          if (!parsedData && sessionParsedDataObj) setParsedData(sessionParsedDataObj);
        } else {
          updateStepUrl(1);
        }
      } else {
        updateStepUrl(1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="px-4 py-8">
        <PageLoadingSkeleton />
      </div>
    );
  }

  return (
    <>
      {/* Auto-save indicator - only show in step 2 */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-16 right-4 z-40 bg-[var(--surface)]/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-[var(--surface-border)]"
        >
          <AutoSaveIndicator status={autoSave.status} lastSaved={autoSave.lastSaved} />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step-1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <StepOnePaste
              jiraContent={jiraContent}
              setJiraContent={setJiraContent}
              onParse={handleParseJira}
            />
          </motion.div>
        )}

        {step === 2 && parsedData && (
          <motion.div
            key="step-2"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
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
          </motion.div>
        )}

        {step === 2 && !parsedData && (
          <motion.div
            key="step-2-error"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="text-center p-10"
          >
            <p className="text-[var(--foreground-secondary)] mb-4">Faltan datos para el paso 2. Por favor, completa el paso 1.</p>
            <button
              onClick={goBackToStep1}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Volver al Paso 1
            </button>
          </motion.div>
        )}

        {step === 3 && parsedData && (
          <motion.div
            key="step-3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            <ReportOutput
              parsedData={parsedData}
              formData={formData}
              hiddenFields={hiddenFields}
              onReset={handleReset}
              onGoBackToStep2={goBackToStep2}
              jiraCode={formData.jiraCode}
            />
          </motion.div>
        )}

        {step === 3 && !parsedData && (
          <motion.div
            key="step-3-error"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="text-center p-10"
          >
            <p className="text-[var(--foreground-secondary)] mb-4">Faltan datos para el paso 3. Por favor, completa los pasos anteriores.</p>
            <button
              onClick={goBackToStep1}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Volver al Paso 1
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Feedback />
    </>
  );
}
