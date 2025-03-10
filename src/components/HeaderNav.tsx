// src/components/HeaderNav.tsx

"use client";

import Link from "next/link";
import React from "react";

export default function HeaderNav() {
  return (
    <header
      className="
        fixed top-0 w-full z-50
        flex items-center justify-between
        p-4 bg-white shadow-sm
      "
    >
      {/* Izquierda: Logo y nombre de la marca */}
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
          {/* Puedes reemplazar el emoticono por otra imagen o ícono SVG si lo prefieres */}
          <span className="text-white text-lg">📝</span>
        </div>
        <span className="text-xl font-bold text-gray-800">
          Generador de Reportes JIRA
        </span>
      </div>

      {/* Derecha: Enlaces de navegación */}
      <nav className="flex space-x-6">
        <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
          Inicio
        </Link>
        <Link href="/help" className="text-gray-600 hover:text-blue-600 transition">
          Ayuda
        </Link>
        <Link href="/release-notes" className="text-gray-600 hover:text-blue-600 transition">
          Release Notes
        </Link>
      </nav>
    </header>
  );
}