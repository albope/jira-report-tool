// src/components/StepOnePaste.tsx
"use client";

import { useRouter } from "next/navigation";
import { Home } from "lucide-react";
import { useState } from "react";

interface StepOnePasteProps {
  jiraContent: string;
  setJiraContent: (value: string) => void;
  onParse: (jiraKey?: string) => void;
}

export default function StepOnePaste({
  jiraContent,
  setJiraContent,
  onParse,
}: StepOnePasteProps) {
  const router = useRouter();
  const [jiraKey, setJiraKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [jiraTitle, setJiraTitle] = useState<string | null>(null);

  const handleFetchSummary = async () => {
    if (!jiraKey.trim()) return;
    setLoading(true);
    setFetchError(null);
    setJiraTitle(null);

    try {
      const res = await fetch(`/api/jira-summary?key=${encodeURIComponent(jiraKey.trim())}`);
      if (!res.ok) {
        let errorMsg = "No se pudo obtener el JIRA";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch { // Variable _e eliminada ya que no se usa
          // No hacer nada si el cuerpo del error no es JSON
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (data.summary) {
        setJiraTitle(data.summary);
        setJiraContent(data.summary);
        if (data.key) setJiraKey(data.key);
      } else {
        setFetchError("No se encontró el título del JIRA.");
        setJiraTitle(null);
        setJiraContent("");
      }
    } catch (err: unknown) {
      console.error("Error en fetchSummary:", err);
      let message = "Error consultando el JIRA. Puedes pegar el contenido manualmente.";
      if (err instanceof Error) {
        message = err.message;
      }
      setFetchError(message);
      setJiraTitle(null);
      setJiraContent("");
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    onParse(jiraKey.trim() ? jiraKey.trim() : undefined);
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto bg-gradient-to-br from-white via-blue-50 to-white shadow-lg rounded-lg p-8 space-y-6">
      <button
        onClick={() => router.push("/")}
        title="Volver al inicio"
        className="absolute top-4 right-4 inline-flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Home className="h-5 w-5" />
      </button>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-800">
          Generador de reportes
        </h1>
        <p className="text-gray-600 text-lg">
          Esta herramienta te permite crear reportes profesionales a partir del contenido de tu JIRA de forma rápida y sencilla.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex items-center mb-2 space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="text-white w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.789 10.28c.75 1.33-.213 2.98-1.742 2.98H4.21c-1.53 0-2.492-1.65-1.743-2.98l5.79-10.28zM11 13a1 1 0 10-2 0 1 1 0 002 0zM9 7a1 1 0 012 0v3a1 1 0 01-2 0V7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Paso 1</h2>
        </div>
        <p className="text-gray-600 ml-10">Introduce el código de JIRA para obtener el título automáticamente.</p>
        <hr className="mt-3 border-gray-200" />
      </div>

      <div className="flex space-x-2 items-center mb-2">
        <input
          type="text"
          placeholder="Ej: SAERAIL-1459"
          value={jiraKey}
          onChange={(e) => setJiraKey(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={handleFetchSummary}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          disabled={loading || !jiraKey.trim()}
        >
          {loading ? "Buscando..." : "Generar título"}
        </button>
      </div>

      {jiraTitle && (
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Título JIRA</label>
          <div className="bg-gray-100 px-4 py-2 rounded-lg text-gray-800">
            {jiraTitle}
          </div>
        </div>
      )}

      {fetchError && (
        <div className="text-red-500 text-sm mb-2">{fetchError}</div>
      )}
      {fetchError && ( 
        <div className="space-y-2">
          <textarea
            id="jira-input"
            className="w-full h-40 border border-gray-300 rounded-lg p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
            placeholder="Introduce aquí el contenido del JIRA manualmente si la consulta automática por identificador ha fallado. Recuerda copiar todo el texto relevante para asegurar un reporte completo."
            value={jiraContent}
            onChange={(e) => setJiraContent(e.target.value)}
          />
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleNextStep}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Siguiente Paso
        </button>
      </div>
    </div>
  );
}