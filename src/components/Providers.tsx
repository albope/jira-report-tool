// src/components/Providers.tsx
"use client";

import React from "react";
import { ToastProvider, ToastContainer } from "@/components/ui/Toast";

interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
};
