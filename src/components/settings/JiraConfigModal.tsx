// src/components/settings/JiraConfigModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings2, CheckCircle2, AlertCircle, ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useJira } from "@/contexts/JiraContext";
import type { JiraCredentials } from "@/types/jira";

export const JiraConfigModal: React.FC = () => {
  const {
    isConfigModalOpen,
    closeConfigModal,
    credentials,
    isConfigured,
    isVerifying,
    error,
    saveCredentials,
    saveCredentialsWithoutVerify,
    clearCredentials,
    clearError,
  } = useJira();

  const [formData, setFormData] = useState<JiraCredentials>({
    domain: "",
    email: "",
    token: "",
  });
  const [showToken, setShowToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Cargar credenciales existentes al abrir
  useEffect(() => {
    if (isConfigModalOpen && credentials) {
      setFormData({
        domain: credentials.domain,
        email: credentials.email,
        token: credentials.token,
      });
    } else if (isConfigModalOpen) {
      setFormData({ domain: "", email: "", token: "" });
    }
    setSaveSuccess(false);
    clearError();
  }, [isConfigModalOpen, credentials, clearError]);

  const handleInputChange = (field: keyof JiraCredentials, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError();
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    const success = await saveCredentials(formData);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        closeConfigModal();
      }, 1500);
    }
  };

  const handleSaveWithoutVerify = () => {
    const success = saveCredentialsWithoutVerify(formData);
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        closeConfigModal();
      }, 1500);
    }
  };

  const handleClear = () => {
    clearCredentials();
    setFormData({ domain: "", email: "", token: "" });
    setSaveSuccess(false);
  };

  const handleClose = () => {
    closeConfigModal();
    clearError();
  };

  return (
    <AnimatePresence>
      {isConfigModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--surface)] dark:bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--surface-border)] dark:border-white/10 pointer-events-auto"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4 border-b border-[var(--surface-border)] dark:border-white/10">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Settings2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)]">
                      Configuración JIRA
                    </h2>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Conecta tu cuenta de Atlassian
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-5">
                {/* Status indicator */}
                {isConfigured && !saveSuccess && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      JIRA configurado correctamente
                    </span>
                  </div>
                )}

                {saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">
                      Credenciales guardadas correctamente
                    </span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  </motion.div>
                )}

                {/* Domain field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Dominio JIRA
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => handleInputChange("domain", e.target.value)}
                    placeholder="empresa.atlassian.net"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--background)] dark:bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                  />
                  <p className="text-xs text-[var(--foreground-muted)]">
                    Sin https:// (ej: miempresa.atlassian.net)
                  </p>
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Email de Atlassian
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--background)] dark:bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all"
                  />
                </div>

                {/* Token field */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    API Token
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={formData.token}
                      onChange={(e) => handleInputChange("token", e.target.value)}
                      placeholder="Tu API token de Atlassian"
                      className="w-full px-4 py-2.5 pr-12 rounded-xl border border-[var(--surface-border)] dark:border-white/10 bg-[var(--background)] dark:bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 focus:border-[var(--primary)] transition-all font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <a
                    href="https://id.atlassian.com/manage-profile/security/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    Generar token en Atlassian
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Security notice */}
                <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Las credenciales se guardan localmente en tu navegador. No se envían a ningún servidor externo excepto la API de JIRA.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-[var(--surface-hover)] dark:bg-white/[0.02] border-t border-[var(--surface-border)] dark:border-white/10 flex justify-between">
                <div>
                  {isConfigured && (
                    <Button
                      variant="secondary"
                      onClick={handleClear}
                      disabled={isVerifying}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      Eliminar configuración
                    </Button>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isVerifying}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isVerifying || !formData.domain || !formData.email || !formData.token}
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Verificando...
                      </>
                    ) : (
                      "Guardar"
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
