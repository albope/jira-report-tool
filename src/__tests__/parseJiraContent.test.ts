import { describe, it, expect } from 'vitest';
import parseJiraContent from '@/utils/parseJiraContent';

describe('parseJiraContent', () => {
  describe('title extraction', () => {
    it('should extract the first line as title', () => {
      const content = `Mi título de JIRA
Descripción
Este es el contenido de la descripción`;

      const result = parseJiraContent(content);

      expect(result.title).toBe('Mi título de JIRA');
    });

    it('should use default title when content is empty', () => {
      const result = parseJiraContent('');

      expect(result.title).toBe('Título por defecto');
    });

    it('should trim whitespace from title', () => {
      const content = `  Mi título con espacios
Descripción
Contenido`;

      const result = parseJiraContent(content);

      expect(result.title).toBe('Mi título con espacios');
    });
  });

  describe('description extraction', () => {
    it('should extract description after "Descripción" line', () => {
      const content = `Título del ticket
Descripción
Esta es la descripción del ticket
Con múltiples líneas`;

      const result = parseJiraContent(content);

      expect(result.description).toContain('Esta es la descripción del ticket');
      expect(result.description).toContain('Con múltiples líneas');
    });

    it('should stop at "CORREGIR EN" section', () => {
      const content = `Título
Descripción
Descripción válida
CORREGIR EN
No debe incluirse esto`;

      const result = parseJiraContent(content);

      expect(result.description).toContain('Descripción válida');
      expect(result.description).not.toContain('No debe incluirse');
    });

    it('should stop at "NOTAS IMPLEMENTACIÓN" section', () => {
      const content = `Título
Descripción
Contenido de descripción
NOTAS IMPLEMENTACIÓN
Esto son notas técnicas`;

      const result = parseJiraContent(content);

      expect(result.description).toContain('Contenido de descripción');
      expect(result.description).not.toContain('notas técnicas');
    });

    it('should use default description when not found', () => {
      const content = `Solo un título
Sin sección de descripción`;

      const result = parseJiraContent(content);

      expect(result.description).toBe('Descripción no detectada (rellenar manualmente o parsear más)');
    });

    it('should handle case-insensitive "descripción"', () => {
      const content = `Título
DESCRIPCIÓN
Contenido en mayúsculas`;

      const result = parseJiraContent(content);

      expect(result.description).toContain('Contenido en mayúsculas');
    });

    it('should handle empty description section', () => {
      const content = `Título
Descripción
CORREGIR EN
otra sección`;

      const result = parseJiraContent(content);

      // Empty description after Descripción heading results in default
      expect(result.description).toBe('Descripción no detectada (rellenar manualmente o parsear más)');
    });
  });

  describe('edge cases', () => {
    it('should handle content with only whitespace lines', () => {
      const content = `

   `;

      const result = parseJiraContent(content);

      expect(result.title).toBe('Título por defecto');
    });

    it('should handle Windows-style line endings (CRLF)', () => {
      const content = "Título\r\nDescripción\r\nContenido de descripción";

      const result = parseJiraContent(content);

      expect(result.title).toBe('Título');
      expect(result.description).toContain('Contenido de descripción');
    });

    it('should handle mixed line endings', () => {
      const content = "Título\nDescripción\r\nContenido\nMás contenido";

      const result = parseJiraContent(content);

      expect(result.title).toBe('Título');
      expect(result.description).toContain('Contenido');
    });
  });
});
