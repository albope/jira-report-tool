"use client";

import { useEffect, useCallback, useRef, useState } from 'react';

type ShortcutHandler = () => void;

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: ShortcutHandler;
  preventDefault?: boolean;
}

/**
 * Hook básico para atajos de teclado (standalone, sin contexto)
 */
// Special characters that require Shift to type - ignore shift check for these
const SHIFT_CHARS = ['?', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', '{', '}', '|', ':', '"', '<', '>', '~'];

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape and Ctrl+S to work even in inputs
        if (e.key !== 'Escape' && !(e.ctrlKey && e.key.toLowerCase() === 's')) return;
      }

      shortcutsRef.current.forEach(shortcut => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = (shortcut.ctrl ?? false) === (e.ctrlKey || e.metaKey);
        const altMatch = (shortcut.alt ?? false) === e.altKey;

        // For special chars that need Shift to type, ignore the shift check
        const isShiftChar = SHIFT_CHARS.includes(shortcut.key);
        const shiftMatch = isShiftChar || (shortcut.shift ?? false) === e.shiftKey;

        if (keyMatch && ctrlMatch && altMatch && shiftMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

/**
 * Hook simplificado para un solo shortcut
 */
export function useKeyboardShortcut(
  key: string,
  handler: ShortcutHandler,
  options: Omit<ShortcutConfig, 'key' | 'handler'> = {},
  enabled: boolean = true
) {
  useKeyboardShortcuts(
    [{ key, handler, ...options }],
    enabled
  );
}

/**
 * Hook para mostrar/ocultar modal de ayuda de shortcuts
 */
export function useShortcutsHelp() {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const openHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const closeHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  // Registrar múltiples formas de mostrar ayuda
  useKeyboardShortcuts([
    { key: '?', handler: toggleHelp },
    { key: '/', ctrl: true, handler: toggleHelp },
    { key: 'F1', handler: toggleHelp },  // Universal
    { key: '¿', handler: toggleHelp },   // Teclado español
  ]);

  // Escape para cerrar
  useKeyboardShortcuts([
    { key: 'Escape', handler: closeHelp },
  ], showHelp);

  return {
    showHelp,
    setShowHelp,
    toggleHelp,
    openHelp,
    closeHelp,
  };
}

/**
 * Formatea las teclas para mostrar en UI
 */
export function formatShortcutKeys(keys: string): string {
  const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);

  return keys
    .split("+")
    .map((key) => {
      const k = key.toLowerCase();
      if (k === "ctrl" || k === "control") return isMac ? "⌘" : "Ctrl";
      if (k === "alt") return isMac ? "⌥" : "Alt";
      if (k === "shift") return "⇧";
      if (k === "meta" || k === "cmd") return "⌘";
      if (k === "enter") return "↵";
      if (k === "escape" || k === "esc") return "Esc";
      if (k === "backspace") return "⌫";
      if (k === "delete") return "Del";
      if (k === "tab") return "Tab";
      if (k === " " || k === "space") return "Space";
      return key.toUpperCase();
    })
    .join(isMac ? " " : "+");
}

// Utility hook for common help page shortcuts
export function useHelpKeyboardShortcuts({
  onSearch,
  onShowShortcuts,
  onEscape,
  onNavigateUp,
  onNavigateDown,
}: {
  onSearch?: () => void;
  onShowShortcuts?: () => void;
  onEscape?: () => void;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
}) {
  const shortcuts: ShortcutConfig[] = [];

  if (onSearch) {
    shortcuts.push({ key: 'k', ctrl: true, handler: onSearch });
  }

  if (onShowShortcuts) {
    shortcuts.push({ key: '?', shift: true, handler: onShowShortcuts });
  }

  if (onEscape) {
    shortcuts.push({ key: 'Escape', handler: onEscape });
  }

  if (onNavigateUp) {
    shortcuts.push({ key: 'ArrowUp', handler: onNavigateUp, preventDefault: false });
  }

  if (onNavigateDown) {
    shortcuts.push({ key: 'ArrowDown', handler: onNavigateDown, preventDefault: false });
  }

  useKeyboardShortcuts(shortcuts);
}
