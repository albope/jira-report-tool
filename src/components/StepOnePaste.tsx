"use client";

interface StepOnePasteProps {
  jiraContent: string;
  setJiraContent: (value: string) => void;
  onParse: () => void;
}

export default function StepOnePaste({
  jiraContent,
  setJiraContent,
  onParse,
}: StepOnePasteProps) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto relative z-10">
      {/* Encabezado con descripción y título del paso */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Generador de reportes</h1>
        <p className="text-gray-600 text-lg">
          Esta herramienta te permite crear reportes profesionales a partir del contenido de tu JIRA de forma rápida y sencilla.
        </p>
        <h2 className="text-2xl font-semibold text-gray-800">
          Paso 1: Ingreso del Contenido JIRA
        </h2>
      </div>

      {/* Área para pegar el contenido del JIRA */}
      <div className="space-y-2">
        <label htmlFor="jira-input" className="block font-medium text-gray-700">
          Contenido del JIRA
        </label>
        <textarea
          id="jira-input"
          className="w-full h-40 border border-gray-300 rounded p-2 placeholder:text-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Pega aquí el contenido del JIRA para el cual quieras generar un reporte."
          value={jiraContent}
          onChange={(e) => setJiraContent(e.target.value)}
        />
      </div>

      {/* Botón para pasar al siguiente paso */}
      <div>
        <button
          onClick={onParse}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition"
        >
          Generar
        </button>
      </div>
    </div>
  );
}