// src/contexts/KeyboardShortcutsContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

/**
 * Definición de un atajo de teclado
 */
export interface KeyboardShortcut {
  /** Identificador único */
  id: string;
  /** Teclas del atajo (ej: "ctrl+s", "escape", "?") */
  keys: string;
  /** Descripción del atajo */
  description: string;
  /** Callback a ejecutar */
  callback: () => void;
  /** Ámbito donde aplica */
  scope?: "global" | "form" | "report" | "modal";
  /** Si está habilitado */
  enabled?: boolean;
  /** Categoría para agrupación */
  category?: string;
}

/**
 * Categorías de shortcuts
 */
export const SHORTCUT_CATEGORIES = {
  navigation: "Navegación",
  actions: "Acciones",
  help: "Ayuda",
  form: "Formulario",
} as const;

/**
 * Shortcuts predefinidos (para mostrar en ayuda)
 */
export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, "callback">[] = [
  {
    id: "save",
    keys: "ctrl+s",
    description: "Guardar reporte actual",
    scope: "global",
    category: "actions",
  },
  {
    id: "next-step",
    keys: "ctrl+enter",
    description: "Ir al siguiente paso",
    scope: "form",
    category: "navigation",
  },
  {
    id: "close-modal",
    keys: "escape",
    description: "Cerrar modal/panel",
    scope: "global",
    category: "navigation",
  },
  {
    id: "copy-report",
    keys: "ctrl+shift+c",
    description: "Copiar reporte al portapapeles",
    scope: "report",
    category: "actions",
  },
  {
    id: "show-help",
    keys: "?",
    description: "Mostrar atajos de teclado",
    scope: "global",
    category: "help",
  },
  {
    id: "show-help-alt",
    keys: "ctrl+/",
    description: "Mostrar atajos de teclado",
    scope: "global",
    category: "help",
  },
  {
    id: "go-section-1",
    keys: "alt+1",
    description: "Ir a sección 1",
    scope: "form",
    category: "form",
  },
  {
    id: "go-section-2",
    keys: "alt+2",
    description: "Ir a sección 2",
    scope: "form",
    category: "form",
  },
  {
    id: "go-section-3",
    keys: "alt+3",
    description: "Ir a sección 3",
    scope: "form",
    category: "form",
  },
  {
    id: "go-section-4",
    keys: "alt+4",
    description: "Ir a sección 4",
    scope: "form",
    category: "form",
  },
  {
    id: "go-home",
    keys: "alt+h",
    description: "Ir al inicio",
    scope: "global",
    category: "navigation",
  },
];

/**
 * Context value
 */
interface KeyboardShortcutsContextValue {
  /** Shortcuts registrados actualmente */
  shortcuts: Map<string, KeyboardShortcut>;
  /** Registrar un shortcut */
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  /** Desregistrar un shortcut */
  unregisterShortcut: (id: string) => void;
  /** Habilitar/deshabilitar un shortcut */
  setShortcutEnabled: (id: string, enabled: boolean) => void;
  /** Mostrar modal de ayuda */
  showHelp: boolean;
  /** Toggle modal de ayuda */
  setShowHelp: (show: boolean) => void;
  /** Ámbito actual activo */
  activeScope: "global" | "form" | "report" | "modal";
  /** Cambiar ámbito activo */
  setActiveScope: (scope: "global" | "form" | "report" | "modal") => void;
  /** Shortcuts habilitados globalmente */
  shortcutsEnabled: boolean;
  /** Habilitar/deshabilitar todos los shortcuts */
  setShortcutsEnabled: (enabled: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

/**
 * Parsea una combinación de teclas en sus componentes
 */
function parseKeys(keys: string): {
  ctrl: boolean;
  alt: boolean;
  shift: boolean;
  meta: boolean;
  key: string;
} {
  const parts = keys.toLowerCase().split("+");
  return {
    ctrl: parts.includes("ctrl") || parts.includes("control"),
    alt: parts.includes("alt"),
    shift: parts.includes("shift"),
    meta: parts.includes("meta") || parts.includes("cmd"),
    key: parts[parts.length - 1],
  };
}

/**
 * Verifica si un evento de teclado coincide con un shortcut
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const parsed = parseKeys(shortcut.keys);
  const eventKey = event.key.toLowerCase();

  // Verificar modificadores
  if (parsed.ctrl !== (event.ctrlKey || event.metaKey)) return false;
  if (parsed.alt !== event.altKey) return false;
  if (parsed.shift !== event.shiftKey) return false;

  // Verificar tecla principal
  // Manejar casos especiales
  if (parsed.key === "enter" && eventKey === "enter") return true;
  if (parsed.key === "escape" && (eventKey === "escape" || eventKey === "esc")) return true;
  if (parsed.key === "/" && eventKey === "/") return true;
  if (parsed.key === "?" && (eventKey === "?" || (event.shiftKey && eventKey === "/"))) return true;

  // Teclas numéricas
  if (/^\d$/.test(parsed.key) && eventKey === parsed.key) return true;

  // Teclas de letra
  if (/^[a-z]$/.test(parsed.key) && eventKey === parsed.key) return true;

  return eventKey === parsed.key;
}

/**
 * Provider para el sistema de atajos de teclado
 */
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Map<string, KeyboardShortcut>>(new Map());
  const [showHelp, setShowHelp] = useState(false);
  const [activeScope, setActiveScope] = useState<"global" | "form" | "report" | "modal">("global");
  const [shortcutsEnabled, setShortcutsEnabled] = useState(true);

  // Ref para acceso sincrónico en el event listener
  const shortcutsRef = useRef(shortcuts);
  const enabledRef = useRef(shortcutsEnabled);
  const scopeRef = useRef(activeScope);
  const showHelpRef = useRef(showHelp);

  // Mantener refs actualizadas
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    enabledRef.current = shortcutsEnabled;
  }, [shortcutsEnabled]);

  useEffect(() => {
    scopeRef.current = activeScope;
  }, [activeScope]);

  useEffect(() => {
    showHelpRef.current = showHelp;
  }, [showHelp]);

  // Registrar shortcut
  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled ?? true });
      return next;
    });
  }, []);

  // Desregistrar shortcut
  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Habilitar/deshabilitar shortcut
  const setShortcutEnabled = useCallback((id: string, enabled: boolean) => {
    setShortcuts((prev) => {
      const shortcut = prev.get(id);
      if (!shortcut) return prev;
      const next = new Map(prev);
      next.set(id, { ...shortcut, enabled });
      return next;
    });
  }, []);

  // Event listener global para keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // No procesar si shortcuts están deshabilitados
      if (!enabledRef.current) return;

      // No procesar si estamos en un input, textarea o contenteditable
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Permitir algunos shortcuts incluso en campos de entrada
      const allowInInput = ["escape", "ctrl+s", "ctrl+enter"];

      // Verificar cada shortcut registrado
      for (const [, shortcut] of shortcutsRef.current) {
        // Saltar si está deshabilitado
        if (!shortcut.enabled) continue;

        // Verificar si el shortcut coincide
        if (!matchesShortcut(event, shortcut)) continue;

        // Verificar ámbito
        const scope = shortcut.scope || "global";
        if (scope !== "global" && scope !== scopeRef.current) continue;

        // Verificar si estamos en input y si está permitido
        if (isInputField && !allowInInput.includes(shortcut.keys.toLowerCase())) continue;

        // Prevenir comportamiento default y ejecutar callback
        event.preventDefault();
        event.stopPropagation();
        shortcut.callback();
        return;
      }

      // Shortcut especial para mostrar ayuda (? o Ctrl+/)
      if (
        (event.key === "?" && !event.ctrlKey && !event.altKey && !isInputField) ||
        (event.key === "/" && event.ctrlKey)
      ) {
        event.preventDefault();
        setShowHelp(!showHelpRef.current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value: KeyboardShortcutsContextValue = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    setShortcutEnabled,
    showHelp,
    setShowHelp,
    activeScope,
    setActiveScope,
    shortcutsEnabled,
    setShortcutsEnabled,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de shortcuts
 */
export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error(
      "useKeyboardShortcutsContext must be used within a KeyboardShortcutsProvider"
    );
  }
  return context;
}
