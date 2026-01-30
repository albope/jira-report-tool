"use client";

import Link from "next/link";
import React from "react";
import { Github } from "lucide-react";

export default function FooterNav() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="
      relative
      bg-[var(--surface)] dark:bg-[var(--background)]
      text-[var(--foreground-tertiary)]
      py-6
      border-t border-[var(--surface-border)] dark:border-white/[0.06]
      transition-colors duration-200
    ">
      {/* Gradient line at top */}
      <div className="
        absolute top-0 left-1/2 -translate-x-1/2
        w-1/2 max-w-md h-[1px]
        bg-gradient-to-r from-transparent via-[var(--primary)]/30 to-transparent
      " />

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright y créditos */}
          <div className="flex items-center gap-1 text-sm">
            <span>© {currentYear}</span>
            <span className="
              font-semibold
              bg-gradient-to-r from-blue-500 to-purple-500
              bg-clip-text text-transparent
            ">
              ETRA I+D
            </span>
          </div>

          {/* Links de navegación */}
          <nav className="flex items-center gap-4 text-sm">
            <FooterLink href="/help">Ayuda</FooterLink>
            <span className="text-[var(--foreground-muted)]">·</span>
            <FooterLink href="/release-notes">Release Notes</FooterLink>
            <span className="text-[var(--foreground-muted)] hidden sm:inline">·</span>
            <FooterLink href="https://github.com" external className="hidden sm:inline-flex">
              <Github size={14} />
              <span>GitHub</span>
            </FooterLink>
          </nav>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({
  href,
  children,
  external = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}) {
  const baseClasses = `
    inline-flex items-center gap-1.5
    text-[var(--foreground-tertiary)]
    hover:text-[var(--primary)] dark:hover:text-white
    transition-colors duration-200
    ${className}
  `;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={baseClasses}>
      {children}
    </Link>
  );
}
