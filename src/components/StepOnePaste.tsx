// src/components/StepOnePaste.tsx
"use client";

import { useRouter } from "next/navigation";
import { Home, Search, AlertTriangle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [fetchedJiraTitle, setFetchedJiraTitle] = useState<string | null>(null);

  // ESTE useEffect ya maneja la actualización de jiraContent cuando fetchedJiraTitle cambia.
  // Si fetchedJiraTitle se pone a null, y jiraContent dependiera SOLO de este efecto
  // para limpiarse, necesitaríamos que setJiraContent("") se llame si fetchedJiraTitle es null.
  // Pero es más directo limpiar jiraContent al iniciar la búsqueda o al cambiar el key.
  useEffect(() => {
    if (fetchedJiraTitle) {
      setJiraContent(fetchedJiraTitle);
    } else {
      // Si el título fetcheado se limpia (ej. al cambiar el key),
      // limpiamos también el jiraContent para evitar mostrar contenido stale.
      // PERO, esto podría ser contraproducente si el usuario ya empezó a escribir manualmente
      // y luego limpia el fetchedJiraTitle por error.
      // Es mejor manejar la limpieza de jiraContent de forma más explícita.
      // Por ahora, comentaré esta parte del 'else' y lo manejaré en otros sitios.
      // setJiraContent(""); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedJiraTitle]); // Solo depende de fetchedJiraTitle

  const handleFetchSummary = async () => {
    if (!jiraKey.trim()) {
        setFetchError("Por favor, introduce un código de JIRA.");
        return;
    }
    setLoading(true);
    setFetchError(null);
    setFetchedJiraTitle(null);
    // Limpiar jiraContent al iniciar una nueva búsqueda para evitar datos stale
    // si la búsqueda falla y el textarea se muestra.
    setJiraContent(""); 

    try {
      const res = await fetch(`/api/jira-summary?key=${encodeURIComponent(jiraKey.trim())}`);
      if (!res.ok) {
        let errorMsg = "No se pudo obtener el título del JIRA desde la API.";
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch { 
          // No hacer nada
        }
        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (data.summary) {
        setFetchedJiraTitle(data.summary); // Esto hará que el useEffect actualice jiraContent
                                         // con el nuevo título.
        if (data.key) setJiraKey(data.key); 
      } else {
        setFetchError("No se encontró un título para este JIRA. Puedes introducir el contenido manualmente.");
        setFetchedJiraTitle(null); // Asegurar que esté limpio
        // jiraContent ya se limpió al inicio de la función.
      }
    } catch (err: unknown) {
      console.error("Error en fetchSummary:", err);
      let message = "Error consultando el JIRA. Puedes pegar el contenido manualmente.";
      if (err instanceof Error) {
        message = err.message;
      }
      setFetchError(message);
      setFetchedJiraTitle(null); // Asegurar que esté limpio
      // jiraContent ya se limpió al inicio de la función. El usuario ahora verá el textarea vacío.
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    onParse(jiraKey.trim() ? jiraKey.trim() : undefined);
  };

  return (
    <div className="relative z-10 max-w-3xl mx-auto bg-gradient-to-br from-white via-blue-50 to-white shadow-xl rounded-xl p-8 space-y-8">
      <button
        onClick={() => router.push("/")}
        title="Volver al inicio"
        className="absolute top-5 right-5 p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <Home className="h-5 w-5" />
      </button>

      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Generador de Reportes
        </h1>
        <p className="text-gray-600 text-lg">
          Introduce el código de JIRA para cargar su título o pega el contenido directamente si la carga falla.
        </p>
      </div>

      <div className="pt-4">
        <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 rounded-t-lg border-b-2 border-blue-500">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
            1
          </div>
          <h2 className="text-xl font-semibold text-blue-700">Cargar o Introducir el título del JIRA</h2>
        </div>
      </div>

      <div className="space-y-6 px-3 pb-3 bg-white border border-t-0 border-gray-200 rounded-b-lg shadow-sm">
        <div className="space-y-4 pt-4">
          <div>
            <label htmlFor="jiraKeyInput" className="block text-sm font-medium text-gray-700 mb-1">
              Código del JIRA
            </label>
            <div className="flex items-stretch gap-3">
              <input
                id="jiraKeyInput"
                type="text"
                placeholder="Ej: SAENEXTBUS-5580"
                value={jiraKey}
                onChange={(e) => {
                  const newKey = e.target.value.toUpperCase();
                  setJiraKey(newKey);
                  if (fetchError) setFetchError(null); 
                  if (fetchedJiraTitle) setFetchedJiraTitle(null);
                  // Si el usuario cambia el JIRA Key, tiene sentido limpiar el contenido
                  // que podría ser de un JIRA anterior, para evitar confusión.
                  setJiraContent(""); 
                }}
                className="flex-grow border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-shadow"
              />
              <button
                onClick={handleFetchSummary}
                className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm hover:shadow-md disabled:opacity-70"
                disabled={loading || !jiraKey.trim()}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-0 sm:mr-2" />
                ) : (
                  <Search className="h-5 w-5 mr-0 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{loading ? "Buscando..." : "Cargar Título"}</span>
                <span className="sm:hidden">{loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}</span>
              </button>
            </div>
          </div>
        </div>
      
        {loading && (
          <div className="flex items-center text-blue-600 text-sm p-3">
            <Loader2 className="h-5 w-5 animate-spin mr-2 flex-shrink-0" />
            Consultando API de JIRA...
          </div>
        )}

        {fetchError && !loading && (
          <div className="flex items-center text-red-600 text-sm p-3 bg-red-50 border border-red-300 rounded-md shadow-sm">
            <AlertTriangle className="h-5 w-5 mr-2.5 flex-shrink-0" />
            {fetchError}
          </div>
        )}

        {fetchedJiraTitle && !loading && !fetchError && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-md shadow-sm">
              <p className="text-sm font-semibold text-green-700">Título JIRA cargado con éxito:</p>
              <p className="text-gray-800 mt-1 text-lg">{fetchedJiraTitle}</p>
              <p className="text-xs text-gray-500 mt-2">Este título se usará como contenido inicial. Podrás editarlo en el Paso 2.</p>
          </div>
        )}

        {(fetchError && !loading) && ( 
          <div className="space-y-2 pt-4 border-t border-gray-100 mt-4">
            <label htmlFor="jira-input" className="block text-sm font-medium text-gray-700">
              Contenido Manual del JIRA <span className="text-red-500">*</span>
            </label>
            <textarea
              id="jira-input"
              className="w-full h-40 border border-gray-300 rounded-lg p-3 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              placeholder="La carga automática falló. Pega aquí el contenido completo del JIRA (título, descripción, etc.)."
              value={jiraContent} 
              onChange={(e) => setJiraContent(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500">Este contenido se usará para el Paso 2.</p>
          </div>
        )}
      </div>


      <div className="pt-6 text-right">
        <button
          onClick={handleNextStep}
          disabled={!loading && (!fetchedJiraTitle && !jiraContent.trim())}
          className="bg-blue-600 text-white py-2.5 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Siguiente Paso
        </button>
      </div>
    </div>
  );
}