// ThemeScript component - runs before React hydration to prevent theme flash
// This must be a .tsx file since it returns JSX

import { THEME_STORAGE_KEY } from "@/hooks/useTheme";

export function ThemeScript() {
  const script = `
    (function() {
      const stored = localStorage.getItem('${THEME_STORAGE_KEY}');
      const theme = stored === 'light' || stored === 'dark' ? stored :
        (stored === 'system' || !stored) && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

export default ThemeScript;
