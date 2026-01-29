"use client";

import Link from "next/link";
import React from "react";
import { FileText } from "lucide-react";

export default function HeaderNav() {
  return (
    <header
      className="
        fixed top-0 w-full z-50
        flex items-center justify-between
        px-4 py-1
        bg-gradient-to-br from-white via-blue-50 to-white
        shadow-sm
      "
    >
      {/* Izquierda: Logo e identificación de la aplicación */}
      <div className="flex items-center space-x-3">
        {/* Ícono circular con color sólido para destacar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <FileText size={16} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-800">
          Generador de Reportes JIRA
        </span>
      </div>

      {/* Derecha: Navegación */}
      <nav className="flex space-x-4">
        <Link href="/" className="text-gray-800 hover:text-blue-600 transition">
          Inicio
        </Link>
        <Link href="/help" className="text-gray-800 hover:text-blue-600 transition">
          Ayuda
        </Link>
        <Link href="/release-notes" className="text-gray-800 hover:text-blue-600 transition">
          Release Notes
        </Link>
      </nav>
    </header>
  );
}