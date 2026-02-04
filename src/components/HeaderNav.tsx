"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { JiraConfigButton } from "@/components/settings";

export default function HeaderNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Inicio" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/history", label: "Historial" },
    { href: "/help", label: "Ayuda" },
  ];

  return (
    <header
      className={`
        fixed top-0 w-full z-50
        transition-all duration-300
        ${isScrolled
          ? "bg-[var(--surface)]/80 dark:bg-[var(--background)]/80 backdrop-blur-xl shadow-sm"
          : "bg-transparent"
        }
        border-b border-transparent
        ${isScrolled ? "border-[var(--surface-border)] dark:border-white/[0.06]" : ""}
      `}
    >
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Izquierda: Logo e identificación de la aplicación */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
          {/* Ícono circular con gradiente y glow */}
          <motion.div
            className="
              relative w-9 h-9 rounded-xl
              bg-gradient-to-br from-blue-600 to-purple-600
              flex items-center justify-center flex-shrink-0
              shadow-[0_0_15px_rgba(59,130,246,0.3)]
              group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
              transition-shadow duration-300
            "
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <FileText size={18} className="text-white" />
          </motion.div>

          {/* Título con hover effect */}
          <span className="text-base sm:text-lg font-bold text-[var(--foreground)] truncate
                         group-hover:text-[var(--primary)] transition-colors duration-200">
            <span className="hidden sm:inline">Generador de Reportes JIRA</span>
            <span className="sm:hidden">JIRA Reports</span>
          </span>
        </Link>

        {/* Controles de la derecha */}
        <div className="flex items-center gap-2">
          {/* JIRA Config Button */}
          <JiraConfigButton size="md" />

          {/* Theme Toggle */}
          <ThemeToggle variant="dropdown" size="md" />

          {/* Botón hamburguesa para móvil */}
          <motion.button
            onClick={toggleMenu}
            className="
              sm:hidden p-2 rounded-lg
              text-[var(--foreground-secondary)]
              hover:text-[var(--primary)]
              hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50
            "
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            whileTap={{ scale: 0.95 }}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>

          {/* Navegación desktop */}
          <nav className="hidden sm:flex items-center space-x-1">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Menú móvil desplegable con animación */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="
              sm:hidden overflow-hidden
              border-t border-[var(--surface-border)] dark:border-white/[0.06]
              bg-[var(--surface)]/95 dark:bg-[var(--background)]/95
              backdrop-blur-xl
            "
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="
                      block px-4 py-3 rounded-xl
                      text-[var(--foreground-secondary)]
                      hover:text-[var(--primary)] dark:hover:text-white
                      hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
                      transition-colors duration-200
                      font-medium
                    "
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* --------------------------  Componentes Internos  ------------------------ */
/* -------------------------------------------------------------------------- */

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        relative px-4 py-2 rounded-lg
        text-[var(--foreground-secondary)]
        hover:text-[var(--primary)] dark:hover:text-white
        hover:bg-[var(--surface-hover)] dark:hover:bg-white/5
        transition-all duration-200
        text-sm font-medium
        group
      "
    >
      {children}
      {/* Underline animado en hover */}
      <span className="
        absolute bottom-1 left-1/2 -translate-x-1/2
        w-0 h-0.5 rounded-full
        bg-gradient-to-r from-blue-500 to-purple-500
        group-hover:w-4/5
        transition-all duration-300
      " />
    </Link>
  );
}
