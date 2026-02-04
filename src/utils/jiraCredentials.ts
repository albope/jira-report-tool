// src/utils/jiraCredentials.ts
// Gestión segura de credenciales JIRA en localStorage

import type { JiraCredentials, StoredJiraCredentials, JiraConfigStatus } from "@/types/jira";

const STORAGE_KEY = "jira-credentials";
const STORAGE_VERSION = 1;

// Clave simple para XOR (no es criptografía fuerte, pero evita plain text)
const OBFUSCATION_KEY = "jrt-2024-secure";

/**
 * Ofusca un string usando XOR + Base64
 * NO es criptografía segura, solo evita lectura directa en DevTools
 */
function obfuscate(text: string): string {
  const keyChars = OBFUSCATION_KEY.split("");
  const textChars = text.split("");

  const xored = textChars.map((char, i) => {
    const keyChar = keyChars[i % keyChars.length];
    return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
  }).join("");

  // Base64 encode
  return btoa(encodeURIComponent(xored));
}

/**
 * Desofusca un string
 */
function deobfuscate(encoded: string): string {
  try {
    const xored = decodeURIComponent(atob(encoded));
    const keyChars = OBFUSCATION_KEY.split("");

    return xored.split("").map((char, i) => {
      const keyChar = keyChars[i % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar.charCodeAt(0));
    }).join("");
  } catch {
    return "";
  }
}

/**
 * Guarda las credenciales en localStorage (ofuscadas)
 */
export function saveCredentials(credentials: JiraCredentials): void {
  const data = JSON.stringify(credentials);
  const stored: StoredJiraCredentials = {
    data: obfuscate(data),
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/**
 * Obtiene las credenciales de localStorage
 * @returns Credenciales o null si no existen/son inválidas
 */
export function getCredentials(): JiraCredentials | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const stored: StoredJiraCredentials = JSON.parse(raw);

    // Verificar versión
    if (stored.version !== STORAGE_VERSION) {
      // En futuras versiones, aquí se haría migración
      clearCredentials();
      return null;
    }

    const data = deobfuscate(stored.data);
    if (!data) return null;

    const credentials: JiraCredentials = JSON.parse(data);

    // Validar estructura básica
    if (!credentials.domain || !credentials.email || !credentials.token) {
      return null;
    }

    return credentials;
  } catch {
    return null;
  }
}

/**
 * Elimina las credenciales de localStorage
 */
export function clearCredentials(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Verifica si hay credenciales configuradas
 */
export function hasCredentials(): boolean {
  return getCredentials() !== null;
}

/**
 * Obtiene el estado de configuración (sin exponer el token)
 */
export function getConfigStatus(): JiraConfigStatus {
  const credentials = getCredentials();

  if (!credentials) {
    return {
      isConfigured: false,
      isVerified: false,
    };
  }

  return {
    isConfigured: true,
    domain: credentials.domain,
    email: credentials.email,
    isVerified: !!credentials.lastVerified,
    lastVerified: credentials.lastVerified,
  };
}

/**
 * Actualiza el timestamp de última verificación
 */
export function updateLastVerified(): void {
  const credentials = getCredentials();
  if (credentials) {
    credentials.lastVerified = new Date().toISOString();
    saveCredentials(credentials);
  }
}

/**
 * Genera el header de autorización Basic para JIRA API
 */
export function getAuthHeader(credentials: JiraCredentials): string {
  const authString = `${credentials.email}:${credentials.token}`;
  return `Basic ${btoa(authString)}`;
}

/**
 * Normaliza el dominio JIRA (quita protocolo y trailing slash)
 */
export function normalizeDomain(domain: string): string {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .trim();
}

/**
 * Valida el formato del dominio JIRA
 */
export function isValidDomain(domain: string): boolean {
  const normalized = normalizeDomain(domain);
  // Debe ser algo como "empresa.atlassian.net" o dominio propio
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(normalized);
}

/**
 * Valida el formato del email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Valida que el token no esté vacío y tenga formato razonable
 */
export function isValidToken(token: string): boolean {
  // Los tokens de Atlassian suelen tener al menos 20 caracteres
  return token.trim().length >= 20;
}

/**
 * Valida todas las credenciales
 */
export function validateCredentials(credentials: Partial<JiraCredentials>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!credentials.domain || !isValidDomain(credentials.domain)) {
    errors.push("El dominio JIRA no es válido (ej: empresa.atlassian.net)");
  }

  if (!credentials.email || !isValidEmail(credentials.email)) {
    errors.push("El email no tiene un formato válido");
  }

  if (!credentials.token || !isValidToken(credentials.token)) {
    errors.push("El API token debe tener al menos 20 caracteres");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
