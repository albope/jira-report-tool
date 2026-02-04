// src/components/StepTwoForm.tsx
"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { ParsedData } from "@/utils/parseJiraContent";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { StaggerContainer } from "@/components/ui/AnimatedContainer";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ValidationSummary } from "@/components/ui/ValidationSummary";

import {
  FormData,
  HiddenFields,
  BatteryTest,
  Incidence,
  Summary,
  GeneralInfoSection,
  EnvironmentConfigSection,
  BatteryTestsSection,
  TestDataSection,
  LogsSection,
  SummarySection,
  IncidencesSection,
  ConclusionsSection,
  FormActions,
  MobileSectionNav,
  defaultSections,
} from "./step-two";

// Re-export types for backwards compatibility
export type { BatteryTest, HiddenFields, FormData } from "./step-two";

interface StepTwoFormProps {
  parsedData: ParsedData;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  hiddenFields: HiddenFields;
  setHiddenFields: React.Dispatch<React.SetStateAction<HiddenFields>>;
  onGenerate: () => void;
  onReset: () => void;
  onGoBackToStep1: () => void;
  jiraCodeLocked?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
  section?: string;
}

function incrementCaseId(originalId: string): string {
  const match = originalId.match(/^(\D*)(\d+)$/);
  if (!match) return originalId + " (copy)";
  const [, prefix, numStr] = match;
  const nextNum = String(parseInt(numStr, 10) + 1).padStart(numStr.length, "0");
  return prefix + nextNum;
}

// Datos de ejemplo para testing
const getTestData = (): Partial<FormData> => ({
  jiraCode: "JIRA-12345",
  date: new Date().toISOString().split("T")[0],
  tester: "QA Tester",
  testStatus: "Exitoso",
  versions: [
    { appName: "Frontend", appVersion: "2.5.1" },
    { appName: "Backend API", appVersion: "1.8.0" },
  ],
  serverPruebas: "srv-qa-01.empresa.local",
  ipMaquina: "192.168.1.100",
  navegador: "Chrome 120.0.6099.130",
  baseDatos: "PostgreSQL 15.2 - qa_database",
  maquetaUtilizada: "Maqueta v3.2 - Producción",
  ambiente: "QA",
  isApp: false,
  endpoint: "https://api.qa.empresa.com/v1",
  sistemaOperativo: "Windows 11 Pro",
  dispositivoPruebas: "Desktop - Intel i7, 16GB RAM",
  precondiciones: "Usuario autenticado con rol de administrador. Datos de prueba cargados en la base de datos.",
  idioma: "Español (ES)",
  batteryTests: [
    {
      id: "PR-001",
      description: "Verificar login con credenciales válidas",
      steps: "Navegar a la página de login\nIngresar usuario: admin@test.com\nIngresar contraseña válida\nClick en botón 'Iniciar sesión'",
      expectedResult: "El usuario es redirigido al dashboard principal y se muestra mensaje de bienvenida",
      obtainedResult: "El usuario fue redirigido correctamente al dashboard. Se mostró el mensaje 'Bienvenido, Admin'",
      testVersion: "1.0",
      testStatus: "Exitoso",
      images: [],
    },
    {
      id: "PR-002",
      description: "Verificar validación de campos obligatorios en formulario",
      steps: "Navegar al formulario de registro\nDejar todos los campos vacíos\nClick en botón 'Guardar'",
      expectedResult: "Se muestran mensajes de error en todos los campos obligatorios",
      obtainedResult: "Se mostraron correctamente los mensajes de validación en los campos: nombre, email y teléfono",
      testVersion: "1.0",
      testStatus: "Exitoso",
      images: [],
    },
    {
      id: "PR-003",
      description: "Verificar exportación de datos a Excel",
      steps: "Navegar a la sección de reportes\nSeleccionar rango de fechas\nClick en 'Exportar a Excel'",
      expectedResult: "Se descarga un archivo .xlsx con los datos del período seleccionado",
      obtainedResult: "El archivo se descargó correctamente con todos los datos esperados",
      testVersion: "1.0",
      testStatus: "Exitoso",
      images: [],
    },
  ],
  summary: {
    totalTests: "3",
    successfulTests: "3",
    failedTests: "0",
    observations: "Todas las pruebas ejecutadas pasaron satisfactoriamente. El sistema responde correctamente bajo condiciones normales de uso.",
  },
  hasIncidences: false,
  incidences: [],
  conclusion: "Las pruebas funcionales del módulo de autenticación y exportación se completaron exitosamente. El sistema cumple con los criterios de aceptación definidos y está listo para pasar al siguiente ambiente.",
  datosDePrueba: "- Usuario de prueba: admin@test.com / Test123!\n- ID de cliente: CLT-001\n- Rango de fechas: 01/01/2024 - 31/01/2024",
  logsRelevantes: "[2024-01-15 10:30:45] INFO: Login successful for user admin@test.com\n[2024-01-15 10:31:02] INFO: Export request initiated\n[2024-01-15 10:31:15] INFO: Export completed successfully",
  customEnvFields: [
    { label: "Rama de código", value: "feature/JIRA-12345" },
    { label: "Build number", value: "#2847" },
  ],
});

export default function StepTwoForm({
  parsedData,
  formData,
  setFormData,
  hiddenFields,
  setHiddenFields,
  onGenerate,
  onReset,
  onGoBackToStep1,
  jiraCodeLocked = false,
}: StepTwoFormProps) {
  const [forceUnlock, setForceUnlock] = useState(false);
  const [showDevButton, setShowDevButton] = useState(false);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Triple-click handler para mostrar botón de dev
  const handleTitleClick = () => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);

    if (clickCountRef.current >= 3) {
      setShowDevButton((prev) => !prev);
      clickCountRef.current = 0;
    }
  };

  // Keyboard shortcut: Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        setShowDevButton((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Rellenar con datos de prueba
  const fillWithTestData = () => {
    const testData = getTestData();
    setFormData((prev) => ({
      ...prev,
      ...testData,
    }));
    toast.success("Datos de prueba cargados", "Se han rellenado todos los campos con datos de ejemplo.");
  };
  const [summaryValidationError, setSummaryValidationError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("general");
  const [showValidation, setShowValidation] = useState(false);
  const toast = useToast();
  const { confirm, ConfirmDialog } = useConfirm();

  // Refs para scroll a secciones
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Calcular progreso del formulario
  const formProgress = useMemo(() => {
    let completed = 0;
    let total = 0;

    // Campos requeridos
    const requiredFields = [
      { field: "jiraCode", value: formData.jiraCode },
      { field: "tester", value: formData.tester },
      { field: "date", value: formData.date },
    ];

    total += requiredFields.length;
    completed += requiredFields.filter((f) => f.value?.trim()).length;

    // Battery tests (al menos 1 completo)
    total += 1;
    const hasCompleteTest = formData.batteryTests.some(
      (t) => t.description.trim() && t.steps.trim() && t.expectedResult.trim()
    );
    if (hasCompleteTest) completed += 1;

    // Conclusiones
    total += 1;
    if (formData.conclusion?.trim()) completed += 1;

    return Math.round((completed / total) * 100);
  }, [formData]);

  // Calcular errores de validación
  const validationErrors = useMemo<ValidationError[]>(() => {
    const errors: ValidationError[] = [];

    if (!formData.jiraCode?.trim()) {
      errors.push({ field: "jiraCode", message: "Código JIRA requerido", section: "Info General" });
    }
    if (!formData.tester?.trim()) {
      errors.push({ field: "tester", message: "Nombre del tester requerido", section: "Info General" });
    }
    if (!formData.date?.trim()) {
      errors.push({ field: "date", message: "Fecha de prueba requerida", section: "Info General" });
    }

    const incompleteTests = formData.batteryTests.filter(
      (t) => !t.description.trim() || !t.steps.trim()
    );
    if (incompleteTests.length > 0) {
      errors.push({
        field: "batteryTests",
        message: `${incompleteTests.length} caso(s) de prueba incompleto(s)`,
        section: "Casos de Prueba",
      });
    }

    if (summaryValidationError) {
      errors.push({ field: "summary", message: summaryValidationError, section: "Resumen" });
    }

    return errors;
  }, [formData, summaryValidationError]);

  // Secciones con estado de completado
  const sectionsWithStatus = useMemo(() => {
    return defaultSections.map((section) => {
      let isComplete = false;
      let hasError = false;

      switch (section.id) {
        case "general":
          isComplete = !!(formData.jiraCode?.trim() && formData.tester?.trim() && formData.date?.trim());
          hasError = validationErrors.some((e) => e.section === "Info General");
          break;
        case "tests":
          isComplete = formData.batteryTests.some((t) => t.description.trim() && t.steps.trim());
          hasError = validationErrors.some((e) => e.section === "Casos de Prueba");
          break;
        case "summary":
          isComplete = !!(formData.summary.totalTests && formData.summary.successfulTests);
          hasError = !!summaryValidationError;
          break;
        case "conclusions":
          isComplete = !!formData.conclusion?.trim();
          break;
      }

      return { ...section, isComplete, hasError };
    });
  }, [formData, validationErrors, summaryValidationError]);

  // Scroll a sección
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const ref = sectionRefs.current[sectionId];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // --- Handlers ---
  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean | Summary
  ) => {
    if (field === "summary" && typeof value === "object") {
      const newSummary = { ...formData.summary, ...value } as Summary;
      const total = parseInt(newSummary.totalTests, 10) || 0;
      const suc = parseInt(newSummary.successfulTests, 10) || 0;
      const fail = parseInt(newSummary.failedTests, 10) || 0;

      if (suc > total || fail > total) {
        setSummaryValidationError("Las pruebas exitosas o fallidas no pueden superar el total.");
      } else if (suc + fail > total) {
        setSummaryValidationError("La suma de exitosas + fallidas no puede superar el total.");
      } else {
        setSummaryValidationError(null);
      }

      setFormData({ ...formData, summary: newSummary });
      return;
    }
    setFormData({ ...formData, [field]: value });
  };

  // Battery Tests handlers
  const addBatteryTest = () => {
    const nt: BatteryTest = {
      id: `PR-${String(formData.batteryTests.length + 1).padStart(3, "0")}`,
      description: "",
      steps: "1. ",
      expectedResult: "",
      obtainedResult: "",
      testVersion: "",
      testStatus: "Pendiente",
      images: [],
    };
    const updatedTests = [...formData.batteryTests, nt];
    setFormData((prev) => ({
      ...prev,
      batteryTests: updatedTests,
      summary: { ...prev.summary, totalTests: String(updatedTests.length) },
    }));
    toast.success("Caso añadido", `Nuevo caso de prueba ${nt.id} creado.`);
  };

  const removeBatteryTest = async (i: number) => {
    const testId = formData.batteryTests[i]?.id || `#${i + 1}`;
    const confirmed = await confirm({
      title: "Eliminar caso de prueba",
      message: `¿Seguro que quieres eliminar el caso de prueba "${testId}"? Esta acción no se puede deshacer.`,
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      const updatedTests = formData.batteryTests.filter((_, index) => index !== i);
      setFormData((prev) => ({
        ...prev,
        batteryTests: updatedTests,
        summary: { ...prev.summary, totalTests: String(updatedTests.length) },
      }));
      toast.success("Caso eliminado", `El caso ${testId} ha sido eliminado.`);
    }
  };

  const duplicateBatteryTest = (i: number) => {
    const orig = formData.batteryTests[i];
    const clone = { ...orig, id: incrementCaseId(orig.id.trim()), images: [] };
    const updatedTests = [
      ...formData.batteryTests.slice(0, i + 1),
      clone,
      ...formData.batteryTests.slice(i + 1),
    ];
    setFormData((prev) => ({
      ...prev,
      batteryTests: updatedTests,
      summary: { ...prev.summary, totalTests: String(updatedTests.length) },
    }));
    toast.info("Caso duplicado", `Se creó una copia: ${clone.id}`);
  };

  const handleBatteryTestChange = (idx: number, field: keyof BatteryTest, val: string) => {
    const updatedTests = formData.batteryTests.map((test, index) => {
      if (index === idx) {
        return { ...test, [field]: val };
      }
      return test;
    });
    setFormData((prev) => ({ ...prev, batteryTests: updatedTests }));
  };

  // Incidences handlers
  const addIncidence = () => {
    const newIncidence: Incidence = {
      id: `INC-${String(formData.incidences.length + 1).padStart(3, "0")}`,
      description: "",
      impact: "Medio",
      status: "Abierto",
    };
    setFormData((prev) => ({
      ...prev,
      incidences: [...prev.incidences, newIncidence],
    }));
  };

  const removeIncidence = async (i: number) => {
    const confirmed = await confirm({
      title: "Eliminar incidencia",
      message: "¿Seguro que quieres eliminar esta incidencia? Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      cancelText: "Cancelar",
      variant: "danger",
    });

    if (confirmed) {
      const updatedIncidences = formData.incidences.filter((_, index) => index !== i);
      setFormData((prev) => ({ ...prev, incidences: updatedIncidences }));
      toast.success("Incidencia eliminada", "La incidencia ha sido eliminada correctamente.");
    }
  };

  const handleIncidenceChange = (idx: number, field: keyof Incidence, val: string) => {
    const updatedIncidences = formData.incidences.map((inc, index) => {
      if (index === idx) {
        return { ...inc, [field]: val };
      }
      return inc;
    });
    setFormData((prev) => ({ ...prev, incidences: updatedIncidences }));
  };

  useEffect(() => {
    if (formData.hasIncidences && formData.incidences.length === 0) {
      addIncidence();
    } else if (!formData.hasIncidences && formData.incidences.length > 0) {
      setFormData((prev) => ({ ...prev, incidences: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.hasIncidences]);

  // Version handlers
  const handleVersionChange = (i: number, field: "appName" | "appVersion", v: string) => {
    const updatedVersions = formData.versions.map((version, index) => {
      if (index === i) {
        return { ...version, [field]: v };
      }
      return version;
    });
    setFormData((prev) => ({ ...prev, versions: updatedVersions }));
  };

  const addVersion = () =>
    setFormData((prev) => ({
      ...prev,
      versions: [...prev.versions, { appName: "", appVersion: "" }],
    }));

  const removeVersion = (i: number) => {
    const updatedVersions = formData.versions.filter((_, index) => index !== i);
    setFormData((prev) => ({ ...prev, versions: updatedVersions }));
  };

  // Custom fields handlers
  const handleCustomFieldChange = (i: number, field: "label" | "value", val: string) => {
    const updatedFields = formData.customEnvFields.map((f, index) => {
      if (index === i) {
        return { ...f, [field]: val };
      }
      return f;
    });
    setFormData((prev) => ({ ...prev, customEnvFields: updatedFields }));
  };

  const addCustomField = () => {
    setFormData((prev) => ({
      ...prev,
      customEnvFields: [...prev.customEnvFields, { label: "", value: "" }],
    }));
  };

  const removeCustomField = (i: number) => {
    const updatedFields = formData.customEnvFields.filter((_, index) => index !== i);
    setFormData((prev) => ({ ...prev, customEnvFields: updatedFields }));
  };

  // Hidden fields handlers
  const hideField = (k: keyof HiddenFields) =>
    setHiddenFields((p) => ({ ...p, [k]: true }));

  const restoreAll = () =>
    setHiddenFields({
      serverPruebas: false,
      ipMaquina: false,
      navegador: false,
      baseDatos: false,
      maquetaUtilizada: false,
      ambiente: false,
    });

  // Validar antes de generar
  const handleGenerate = () => {
    if (validationErrors.length > 0) {
      setShowValidation(true);
      toast.warning("Formulario incompleto", "Revisa los campos requeridos antes de continuar.");
      return;
    }
    onGenerate();
  };

  return (
    <>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        {/* Step 2 Header - Premium Design */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="
            bg-[var(--surface)] dark:bg-[var(--surface)]/80
            dark:backdrop-blur-xl
            rounded-2xl
            border border-[var(--surface-border)] dark:border-white/[0.06]
            shadow-lg dark:shadow-2xl
            overflow-hidden
          "
        >
          {/* Header Content */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4">
                {/* Icon with gradient */}
                <div className="
                  w-12 h-12 rounded-xl
                  bg-gradient-to-br from-blue-600 to-violet-600
                  flex items-center justify-center flex-shrink-0
                  shadow-lg
                ">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>

                <div>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] cursor-default select-none"
                    onClick={handleTitleClick}
                  >
                    Datos del Reporte
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="
                      px-2.5 py-1 rounded-full
                      bg-[var(--primary-soft)] dark:bg-[var(--primary)]/10
                      text-xs font-medium text-[var(--primary)]
                    ">
                      Paso 2 de 3
                    </span>
                    <span className="text-sm text-[var(--foreground-tertiary)]">
                      Completa la información
                    </span>
                    {/* Dev button - hidden by default */}
                    {showDevButton && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={fillWithTestData}
                        className="
                          ml-2 px-2 py-1 rounded-md
                          bg-amber-500/20 text-amber-600 dark:text-amber-400
                          text-xs font-medium
                          hover:bg-amber-500/30 transition-colors
                          border border-amber-500/30
                        "
                      >
                        🧪 Rellenar datos de prueba
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Ring + Back Button */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <ProgressRing
                  progress={formProgress}
                  size="md"
                  variant="gradient"
                  label="Completado"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onGoBackToStep1}
                  className="
                    inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                    text-sm font-medium
                    bg-[var(--surface-hover)] dark:bg-white/[0.05]
                    border border-transparent dark:border-white/[0.06]
                    text-[var(--foreground-secondary)]
                    hover:text-[var(--primary)]
                    hover:bg-[var(--primary-soft)] dark:hover:bg-[var(--primary)]/10
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
                  "
                >
                  <ArrowLeft size={16} />
                  <span className="hidden sm:inline">Volver</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Mobile Section Navigation */}
          <div className="px-4 pb-4 sm:hidden">
            <MobileSectionNav
              sections={sectionsWithStatus}
              activeSection={activeSection}
              onSectionChange={scrollToSection}
            />
          </div>
        </motion.div>

        {/* Validation Summary */}
        {showValidation && validationErrors.length > 0 && (
          <ValidationSummary
            errors={validationErrors}
            onErrorClick={(field) => {
              // Buscar la sección del campo
              const error = validationErrors.find((e) => e.field === field);
              if (error?.section) {
                const sectionMap: Record<string, string> = {
                  "Info General": "general",
                  "Casos de Prueba": "tests",
                  "Resumen": "summary",
                };
                const sectionId = sectionMap[error.section];
                if (sectionId) scrollToSection(sectionId);
              }
            }}
            onDismiss={() => setShowValidation(false)}
          />
        )}

        {/* Form Sections with staggered animation */}
        <StaggerContainer className="space-y-6">
          <div ref={(el) => { sectionRefs.current["general"] = el; }}>
            <GeneralInfoSection
              parsedTitle={parsedData.title}
              formData={formData}
              onInputChange={handleInputChange}
              jiraCodeLocked={jiraCodeLocked}
              forceUnlock={forceUnlock}
              setForceUnlock={setForceUnlock}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["environment"] = el; }}>
            <EnvironmentConfigSection
              formData={formData}
              onInputChange={handleInputChange}
              hiddenFields={hiddenFields}
              hideField={hideField}
              restoreAll={restoreAll}
              onVersionChange={handleVersionChange}
              addVersion={addVersion}
              removeVersion={removeVersion}
              onCustomFieldChange={handleCustomFieldChange}
              addCustomField={addCustomField}
              removeCustomField={removeCustomField}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["tests"] = el; }}>
            <BatteryTestsSection
              formData={formData}
              setFormData={setFormData}
              onTestChange={handleBatteryTestChange}
              onAddTest={addBatteryTest}
              onRemoveTest={removeBatteryTest}
              onDuplicateTest={duplicateBatteryTest}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["testdata"] = el; }}>
            <TestDataSection
              formData={formData}
              onInputChange={handleInputChange}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["logs"] = el; }}>
            <LogsSection
              formData={formData}
              onInputChange={handleInputChange}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["summary"] = el; }}>
            <SummarySection
              formData={formData}
              onInputChange={handleInputChange}
              summaryValidationError={summaryValidationError}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["incidences"] = el; }}>
            <IncidencesSection
              formData={formData}
              onInputChange={handleInputChange}
              onIncidenceChange={handleIncidenceChange}
              addIncidence={addIncidence}
              removeIncidence={removeIncidence}
              collapsible
            />
          </div>

          <div ref={(el) => { sectionRefs.current["conclusions"] = el; }}>
            <ConclusionsSection
              formData={formData}
              onInputChange={handleInputChange}
              collapsible
            />
          </div>
        </StaggerContainer>

        <FormActions onReset={onReset} onGenerate={handleGenerate} />
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog />
    </>
  );
}
