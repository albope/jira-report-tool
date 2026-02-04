// src/types/jira.ts
// Tipos para la integración con JIRA API

/**
 * Credenciales de usuario para autenticación con JIRA
 */
export interface JiraCredentials {
  /** Dominio de JIRA sin protocolo (ej: "empresa.atlassian.net") */
  domain: string;
  /** Email de la cuenta de Atlassian */
  email: string;
  /** API Token generado en id.atlassian.com */
  token: string;
  /** Timestamp de la última verificación exitosa */
  lastVerified?: string;
}

/**
 * Información básica de un issue de JIRA
 */
export interface JiraIssue {
  /** Clave del issue (ej: "PROJ-123") */
  key: string;
  /** Título/resumen del issue */
  summary: string;
  /** Estado actual (ej: "In Progress", "Done") */
  status: string;
  /** Nombre del color del estado para UI */
  statusCategory?: "todo" | "in_progress" | "done";
  /** Usuario asignado */
  assignee?: string;
  /** Avatar URL del asignado */
  assigneeAvatar?: string;
  /** Descripción del issue */
  description?: string;
  /** Tipo de issue (Bug, Story, Task, etc.) */
  issueType?: string;
  /** Icono del tipo de issue */
  issueTypeIcon?: string;
  /** Prioridad */
  priority?: string;
  /** Fecha de creación */
  created?: string;
  /** Fecha de última actualización */
  updated?: string;
}

/**
 * Resultado de una búsqueda JQL
 */
export interface JiraSearchResult {
  /** Lista de issues encontrados */
  issues: JiraIssue[];
  /** Total de resultados (puede ser mayor que issues.length si hay paginación) */
  total: number;
  /** Offset actual */
  startAt: number;
  /** Máximo de resultados por página */
  maxResults: number;
}

/**
 * Comentario de JIRA
 */
export interface JiraComment {
  /** ID único del comentario */
  id: string;
  /** Contenido del comentario (puede ser markdown o ADF) */
  body: string;
  /** Fecha de creación ISO */
  created: string;
  /** Fecha de última actualización ISO */
  updated: string;
  /** Autor del comentario */
  author: {
    displayName: string;
    emailAddress?: string;
    avatarUrl?: string;
  };
  /** Indica si este comentario parece ser un reporte de pruebas */
  isTestReport?: boolean;
}

/**
 * Respuesta al crear/actualizar un comentario
 */
export interface JiraCommentResponse {
  success: boolean;
  commentId?: string;
  error?: string;
}

/**
 * Estado de la configuración JIRA
 */
export interface JiraConfigStatus {
  /** Si hay credenciales guardadas */
  isConfigured: boolean;
  /** Dominio configurado (sin token) */
  domain?: string;
  /** Email configurado */
  email?: string;
  /** Si las credenciales fueron verificadas recientemente */
  isVerified: boolean;
  /** Timestamp de última verificación */
  lastVerified?: string;
}

/**
 * Opciones para búsqueda de issues
 */
export interface JiraSearchOptions {
  /** Texto a buscar (en key o summary) */
  query: string;
  /** Proyecto específico para filtrar */
  project?: string;
  /** Máximo de resultados */
  maxResults?: number;
  /** Offset para paginación */
  startAt?: number;
  /** Ordenamiento */
  orderBy?: "created" | "updated" | "key";
  /** Dirección del ordenamiento */
  orderDirection?: "ASC" | "DESC";
}

/**
 * Payload para crear/actualizar comentario
 */
export interface JiraCommentPayload {
  /** Clave del issue */
  issueKey: string;
  /** Contenido del comentario */
  comment: string;
  /** ID del comentario a actualizar (si es update) */
  commentId?: string;
}

/**
 * Datos almacenados en localStorage (ofuscados)
 */
export interface StoredJiraCredentials {
  /** Datos ofuscados */
  data: string;
  /** Versión del esquema de almacenamiento */
  version: number;
  /** Timestamp de guardado */
  savedAt: string;
}
