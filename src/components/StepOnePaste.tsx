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
    <div
      className="
        max-w-3xl mx-auto
        bg-gradient-to-br from-white via-blue-50 to-white
        shadow-lg rounded-lg p-8 space-y-6 relative z-10
      "
    >
      {/* Encabezado principal */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-800">
          Generador de reportes
        </h1>
        <p className="text-gray-600 text-lg">
          Esta herramienta te permite crear reportes profesionales a partir del contenido de tu JIRA de forma rápida y sencilla.
        </p>
      </div>

      {/* Encabezado del Paso 1 con ícono + título + subtítulo */}
      <div className="mb-6">
        <div className="flex items-center mb-2 space-x-2">
          {/* Ícono circular */}
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <svg
              className="text-white w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.789 10.28c.75 1.33-.213 2.98-1.742 2.98H4.21c-1.53 0-2.492-1.65-1.743-2.98l5.79-10.28zM11 13a1 1 0 10-2 0 1 1 0 002 0zM9 7a1 1 0 012 0v3a1 1 0 01-2 0V7z" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            Paso 1
          </h2>
        </div>

        <p className="text-gray-600 ml-10">
          Ingresa el contenido del JIRA
        </p>

        {/* Línea divisoria */}
        <hr className="mt-3 border-gray-200" />
      </div>

      {/* Área para pegar el contenido del JIRA */}
      <div className="space-y-2">
        <textarea
          id="jira-input"
          className="
            w-full
            h-40
            border
            border-gray-300
            rounded-lg
            p-2
            placeholder:text-gray-400
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:border-transparent
            shadow-inner
          "
          placeholder="Pega aquí el contenido del JIRA para el cual quieras generar un reporte."
          value={jiraContent}
          onChange={(e) => setJiraContent(e.target.value)}
        />
      </div>

      {/* Botón para pasar al siguiente paso */}
      <div className="pt-2">
        <button
          onClick={onParse}
          className="
            bg-blue-600
            text-white
            py-2
            px-6
            rounded-lg
            hover:bg-blue-700
            transition
            duration-200
            focus:outline-none
            focus:ring-2
            focus:ring-blue-500
            focus:ring-offset-2
          "
        >
          Siguiente Paso
        </button>
      </div>
    </div>
  );
}