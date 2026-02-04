import { describe, it, expect } from 'vitest';
import formatReport, { FormData, HiddenFields } from '@/utils/formatReport';
import { ParsedData } from '@/utils/parseJiraContent';

// Helper to create minimal valid form data
const createFormData = (overrides: Partial<FormData> = {}): FormData => ({
  jiraCode: 'TEST-123',
  date: '2024-01-15',
  tester: 'Tester QA',
  testStatus: 'Exitosa',
  versions: [{ appName: 'App', appVersion: '1.0.0' }],
  serverPruebas: '',
  ipMaquina: '',
  navegador: '',
  baseDatos: '',
  maquetaUtilizada: '',
  ambiente: '',
  batteryTests: [],
  summary: {
    totalTests: '1',
    successfulTests: '1',
    failedTests: '0',
    observations: 'Todo correcto',
  },
  incidences: [],
  hasIncidences: false,
  conclusion: 'Prueba completada exitosamente',
  datosDePrueba: '',
  customEnvFields: [],
  ...overrides,
});

const createHiddenFields = (overrides: Partial<HiddenFields> = {}): HiddenFields => ({
  serverPruebas: false,
  ipMaquina: false,
  navegador: false,
  baseDatos: false,
  maquetaUtilizada: false,
  ambiente: false,
  ...overrides,
});

const createParsedData = (overrides: Partial<ParsedData> = {}): ParsedData => ({
  title: 'Ticket de prueba',
  description: 'Descripción del ticket',
  ...overrides,
});

describe('formatReport', () => {
  describe('basic structure', () => {
    it('should include all main sections', () => {
      const result = formatReport(
        createParsedData(),
        createFormData(),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('📌 **Información General**');
      expect(result).toContain('📌 **Versiones del Sistema**');
      expect(result).toContain('🖥️ **Entorno de Pruebas**');
      expect(result).toContain('✅ **Batería de Pruebas**');
      expect(result).toContain('💾 **Datos de Prueba**');
      expect(result).toContain('📎 **Evidencias**');
      expect(result).toContain('📝 **Logs Relevantes**');
      expect(result).toContain('📊 **Resumen de Resultados**');
      expect(result).toContain('🛠️ **Incidencias Detectadas**');
      expect(result).toContain('📌 **Conclusiones**');
    });

    it('should include general information', () => {
      const result = formatReport(
        createParsedData({ title: 'Mi Ticket JIRA' }),
        createFormData({ jiraCode: 'PROJ-456', tester: 'Juan Pérez' }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('**Título:** Mi Ticket JIRA');
      expect(result).toContain('**Código de JIRA:** PROJ-456');
      expect(result).toContain('**Tester:** Juan Pérez');
    });
  });

  describe('version table', () => {
    it('should format versions table correctly', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          versions: [
            { appName: 'Frontend', appVersion: '2.0.0' },
            { appName: 'Backend', appVersion: '1.5.0' },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('| Frontend | 2.0.0 |');
      expect(result).toContain('| Backend | 1.5.0 |');
    });

    it('should escape pipe characters in versions', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          versions: [{ appName: 'App|Name', appVersion: '1|0' }],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('App\\|Name');
      expect(result).toContain('1\\|0');
    });

    it('should show placeholder when no versions', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ versions: [] }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('(No hay versiones)');
    });
  });

  describe('battery tests', () => {
    it('should format battery tests table', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          batteryTests: [
            {
              id: 'TC-001',
              description: 'Test login',
              steps: '1. Go to login\n2. Enter credentials',
              expectedResult: 'Successful login',
              obtainedResult: 'Login OK',
              testVersion: '1.0',
              testStatus: 'Exitoso',
            },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('TC-001');
      expect(result).toContain('Test login');
      expect(result).toContain('Successful login');
    });

    it('should format steps as numbered list for JIRA', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          batteryTests: [
            {
              id: 'TC-001',
              description: 'Test',
              steps: 'Step one\nStep two\nStep three',
              expectedResult: 'OK',
              obtainedResult: 'OK',
              testVersion: '1.0',
              testStatus: 'Exitoso',
            },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      // Para JIRA: formato numerado inline separado por ║
      expect(result).toContain('1. Step one');
      expect(result).toContain('2. Step two');
      expect(result).toContain('3. Step three');
    });

    it('should format steps with bullet points and <br> for DOCX', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          batteryTests: [
            {
              id: 'TC-001',
              description: 'Test',
              steps: 'Step one\nStep two\nStep three',
              expectedResult: 'OK',
              obtainedResult: 'OK',
              testVersion: '1.0',
              testStatus: 'Exitoso',
            },
          ],
        }),
        createHiddenFields(),
        'docx'
      );

      // Para DOCX: usa bullets y <br> para saltos de línea
      expect(result).toContain('• Step one<br>• Step two<br>• Step three');
    });

    it('should show placeholder when no tests', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ batteryTests: [] }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('(Sin pruebas)');
    });
  });

  describe('environment fields', () => {
    it('should include environment fields when not hidden', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          serverPruebas: 'Server UAT',
          navegador: 'Chrome 120',
          ambiente: 'UAT',
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('**Servidor de Pruebas:** Server UAT');
      expect(result).toContain('**Navegador:** Chrome 120');
      expect(result).toContain('**Ambiente:** UAT');
    });

    it('should hide fields when marked as hidden', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          serverPruebas: 'Server UAT',
          navegador: 'Chrome 120',
        }),
        createHiddenFields({
          serverPruebas: true,
        }),
        'jira'
      );

      expect(result).not.toContain('Server UAT');
      expect(result).toContain('Chrome 120');
    });

    it('should include custom environment fields', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          customEnvFields: [
            { label: 'API Key', value: 'secret-key' },
            { label: 'Timeout', value: '30s' },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('**API Key:** secret-key');
      expect(result).toContain('**Timeout:** 30s');
    });
  });

  describe('incidences', () => {
    it('should show incidences table when hasIncidences is true', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          hasIncidences: true,
          incidences: [
            {
              id: 'INC-001',
              description: 'Button not working',
              impact: 'Alto',
              status: 'Abierto',
            },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('INC-001');
      expect(result).toContain('Button not working');
      expect(result).toContain('Alto');
      expect(result).toContain('Abierto');
    });

    it('should show no incidences message when none detected', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ hasIncidences: false, incidences: [] }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('No se detectaron incidencias durante las pruebas');
    });
  });

  describe('evidences handling', () => {
    it('should show image placeholders for JIRA output', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          batteryTests: [
            {
              id: 'TC-001',
              description: 'Test',
              steps: 'Step 1',
              expectedResult: 'OK',
              obtainedResult: 'OK',
              testVersion: '1.0',
              testStatus: 'Exitoso',
              images: ['data:image/png;base64,abc123'],
            },
          ],
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('TC-001');
      expect(result).toContain('adjuntado');
      expect(result).not.toContain('!['); // No markdown images for JIRA
    });

    it('should include markdown images for DOCX output', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          batteryTests: [
            {
              id: 'TC-001',
              description: 'Test',
              steps: 'Step 1',
              expectedResult: 'OK',
              obtainedResult: 'OK',
              testVersion: '1.0',
              testStatus: 'Exitoso',
              images: ['data:image/png;base64,abc123'],
            },
          ],
        }),
        createHiddenFields(),
        'docx'
      );

      expect(result).toContain('![TC-001');
      expect(result).toContain('data:image/png;base64,abc123');
    });

    it('should show no evidence message when no images', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ batteryTests: [] }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('(No hay evidencias adjuntas)');
    });
  });

  describe('APP section', () => {
    it('should include APP section when isApp is true', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          isApp: true,
          endpoint: 'https://api.example.com',
          sistemaOperativo: 'Android 13',
          dispositivoPruebas: 'Pixel 7',
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('📱 **Validación de Aplicación**');
      expect(result).toContain('https://api.example.com');
      expect(result).toContain('Android 13');
      expect(result).toContain('Pixel 7');
    });

    it('should not include APP section when isApp is false', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ isApp: false }),
        createHiddenFields(),
        'jira'
      );

      expect(result).not.toContain('📱 **Validación de Aplicación**');
    });
  });

  describe('logs section', () => {
    it('should format logs in code block', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          logsRelevantes: '[ERROR] 2024-01-15 - Connection failed',
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('```log');
      expect(result).toContain('[ERROR] 2024-01-15 - Connection failed');
      expect(result).toContain('```');
    });

    it('should show placeholder when no logs', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ logsRelevantes: '' }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('(No se adjuntaron logs)');
    });
  });

  describe('summary table', () => {
    it('should include summary statistics', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({
          summary: {
            totalTests: '10',
            successfulTests: '8',
            failedTests: '2',
            observations: 'Some tests need review',
          },
        }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('| 10 |');
      expect(result).toContain('| 8 |');
      expect(result).toContain('| 2 |');
      expect(result).toContain('Some tests need review');
    });
  });

  describe('date handling', () => {
    it('should use provided date', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ date: '2024-06-15' }),
        createHiddenFields(),
        'jira'
      );

      expect(result).toContain('**Fecha de Prueba:** 2024-06-15');
    });

    it('should use current date when not provided', () => {
      const result = formatReport(
        createParsedData(),
        createFormData({ date: '' }),
        createHiddenFields(),
        'jira'
      );

      // Should contain a date in ISO format (YYYY-MM-DD)
      expect(result).toMatch(/\*\*Fecha de Prueba:\*\* \d{4}-\d{2}-\d{2}/);
    });
  });
});
