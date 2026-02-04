// src/components/GlobalKeyboardShortcuts.tsx
"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useKeyboardShortcuts, useShortcutsHelp } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsHelp } from "@/components/ui/KeyboardShortcutsHelp";

/**
 * Componente que maneja los atajos de teclado globales de la aplicación
 * y renderiza el modal de ayuda
 */
export function GlobalKeyboardShortcuts() {
  const router = useRouter();
  const { showHelp, closeHelp } = useShortcutsHelp();

  // Atajo: Alt+H → Ir al inicio
  const handleGoHome = useCallback(() => {
    router.push("/");
  }, [router]);

  // Registrar shortcuts globales
  useKeyboardShortcuts([
    {
      key: "h",
      alt: true,
      handler: handleGoHome,
    },
  ]);

  return (
    <KeyboardShortcutsHelp
      isOpen={showHelp}
      onClose={closeHelp}
    />
  );
}
