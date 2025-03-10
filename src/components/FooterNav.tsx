// src/components/FooterNav.tsx
"use client";

import Link from "next/link";
import React from "react";

export default function FooterNav() {
  return (
    <footer className="bg-gray-50 text-gray-600 text-sm py-4 mt-0">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-2">
        {/* Single line: © 2025 ETRA I+D | Ayuda | Release Notes */}
        <div className="space-x-3">
          <span>© 2025 ETRA I+D</span>
          <span>|</span>
          <Link href="/help" className="hover:text-blue-600 transition">
            Ayuda
          </Link>
          <span>|</span>
          <Link href="/release-notes" className="hover:text-blue-600 transition">
            Release Notes
          </Link>
        </div>
      </div>
    </footer>
  );
}