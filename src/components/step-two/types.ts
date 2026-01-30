// src/components/step-two/types.ts

export interface BatteryTest {
  id: string;
  description: string;
  steps: string;
  expectedResult: string;
  obtainedResult: string;
  testVersion: string;
  testStatus: string;
  images?: string[];
}

export interface Incidence {
  id: string;
  description: string;
  impact: string;
  status: string;
}

export interface Summary {
  totalTests: string;
  successfulTests: string;
  failedTests: string;
  observations: string;
}

export interface HiddenFields {
  serverPruebas: boolean;
  ipMaquina: boolean;
  navegador: boolean;
  baseDatos: boolean;
  maquetaUtilizada: boolean;
  ambiente: boolean;
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

export interface StepTwoFormProps {
  parsedData: {
    title: string;
    [key: string]: unknown;
  };
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  hiddenFields: HiddenFields;
  setHiddenFields: React.Dispatch<React.SetStateAction<HiddenFields>>;
  onGenerate: () => void;
  onReset: () => void;
  onGoBackToStep1: () => void;
  jiraCodeLocked?: boolean;
}
