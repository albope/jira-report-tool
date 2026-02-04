// src/components/Providers.tsx
"use client";

import React from "react";
import { ToastProvider, ToastContainer } from "@/components/ui/Toast";
import { JiraProvider } from "@/contexts/JiraContext";
import { JiraConfigModal } from "@/components/settings";
import { GlobalKeyboardShortcuts } from "@/components/GlobalKeyboardShortcuts";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      <JiraProvider>
        {children}
        <JiraConfigModal />
        <GlobalKeyboardShortcuts />
      </JiraProvider>
      <ToastContainer />
    </ToastProvider>
  );
};
