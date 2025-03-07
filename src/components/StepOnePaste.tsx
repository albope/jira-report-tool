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
    <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-white shadow-lg rounded-lg p-8 space-y-6 relative z-10">
      {/* Encabezado con descripción y título del paso */}
      <div className="space-y-3">
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
        <label
          htmlFor="jira-input"
          className="block font-medium text-gray-700"
        >
          Contenido del JIRA
        </label>
        <textarea
          id="jira-input"
          className="w-full h-40 border border-gray-300 rounded-lg p-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-inner"
          placeholder="Pega aquí el contenido del JIRA para el cual quieras generar un reporte."
          value={jiraContent}
          onChange={(e) => setJiraContent(e.target.value)}
        />
      </div>

      {/* Botón para pasar al siguiente paso */}
      <div className="pt-2">
        <button
          onClick={onParse}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generar
        </button>
      </div>
    </div>
  );
}