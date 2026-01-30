# Plan de Mejoras: JIRA Report Tool
## Objetivo: Convertir esta herramienta en la más profesional del mercado

---

# 🎨 PROMPT PARA AGENTE FRONTEND - REDISEÑO VISUAL PREMIUM

## Contexto del Proyecto

Estás trabajando en **JIRA Report Tool**, una aplicación Next.js 15 + React 19 + TailwindCSS para generar reportes de testing desde JIRA. Ya tiene dark mode implementado con variables CSS, pero la estética es muy básica y genérica. Necesita un rediseño visual **ULTRA-PREMIUM**.

## Objetivo Principal

Transformar la UI actual en una experiencia visual de **nivel elite** inspirada en:
- **Vercel** - Minimalismo elegante, gradientes sutiles, glassmorphism, negro profundo
- **Linear** - Animaciones fluidas, colores neón sobre oscuro, micro-interacciones
- **Stripe** - Gradientes mesh complejos, profundidad visual, texturas
- **Raycast** - Bordes brillantes, glow effects, sensación de producto pulido

## Stack Tecnológico Disponible

```
- Next.js 15.1.7 (App Router)
- React 19
- TailwindCSS 3.4.17 (darkMode: "class" ya configurado)
- Framer Motion (instalado pero subutilizado)
- Variables CSS en globals.css
- TypeScript
```

## Archivos Principales a Transformar

```
PRIORIDAD ALTA:
├── src/app/page.tsx                    # Landing page - IMPACTO VISUAL MÁXIMO
├── src/app/globals.css                 # Variables CSS del tema
├── src/components/HeaderNav.tsx        # Navegación principal
├── src/components/FooterNav.tsx        # Footer

PRIORIDAD MEDIA:
├── src/components/StepOnePaste.tsx     # Paso 1 del wizard
├── src/components/StepTwoForm.tsx      # Paso 2 del wizard
├── src/components/step-two/FormSection.tsx
├── src/components/step-two/StyledFormComponents.tsx
├── src/components/step-two/BatteryTestCaseCard.tsx

CONFIGURACIÓN:
├── tailwind.config.ts                  # Extender con nuevos colores/efectos
```

---

## ESPECIFICACIONES DE DISEÑO PREMIUM

### 1. PALETA DE COLORES DARK MODE (Actualizar globals.css)

```css
.dark {
  /* Fondos - Negro profundo estilo Vercel */
  --background: #09090B;
  --background-secondary: #0F0F12;
  --background-tertiary: #18181B;

  /* Superficies con elevación */
  --surface: #1A1A1D;
  --surface-hover: #222225;
  --surface-active: #2A2A2E;
  --surface-border: rgba(255, 255, 255, 0.06);
  --surface-border-bright: rgba(255, 255, 255, 0.12);

  /* Texto con mejor jerarquía */
  --foreground: #FAFAFA;
  --foreground-secondary: #A1A1AA;
  --foreground-tertiary: #71717A;
  --foreground-muted: #52525B;

  /* Primary con glow */
  --primary: #3B82F6;
  --primary-hover: #60A5FA;
  --primary-glow: rgba(59, 130, 246, 0.25);
  --primary-soft: rgba(59, 130, 246, 0.1);

  /* Gradientes para elementos especiales */
  --gradient-primary: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
  --gradient-accent: linear-gradient(135deg, #EC4899 0%, #8B5CF6 50%, #3B82F6 100%);
  --gradient-success: linear-gradient(135deg, #10B981 0%, #34D399 100%);

  /* Sombras con profundidad */
  --shadow-glow: 0 0 30px -5px var(--primary-glow);
  --shadow-elevated: 0 8px 32px rgba(0, 0, 0, 0.4);
}
```

### 2. LANDING PAGE (`page.tsx`) - Transformación Completa

**FONDO:**
- Implementar gradient mesh animado sutil O grid pattern con efecto de perspectiva
- Añadir noise texture overlay muy sutil (opacity: 0.02-0.04)
- Considerar efecto de spotlight que sigue el cursor

**HERO TITLE:**
```tsx
// Texto con gradiente animado (shimmer effect)
<h1 className="text-6xl font-bold">
  Herramienta de{" "}
  <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500
                   bg-clip-text text-transparent
                   bg-[length:200%_auto] animate-gradient">
    Reportes JIRA
  </span>
</h1>

// Añadir keyframe en tailwind.config.ts:
animation: {
  gradient: 'gradient 3s linear infinite',
},
keyframes: {
  gradient: {
    '0%, 100%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
  },
},
```

**BOTONES CTA:**
```tsx
// Botón Primario con glow
<button className="
  relative px-8 py-4 rounded-xl font-semibold
  bg-gradient-to-r from-blue-600 to-purple-600
  text-white
  shadow-[0_0_20px_rgba(59,130,246,0.3)]
  hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
  hover:scale-[1.02]
  transition-all duration-300
  before:absolute before:inset-0 before:rounded-xl
  before:bg-gradient-to-r before:from-blue-400 before:to-purple-400
  before:opacity-0 before:hover:opacity-20
  before:transition-opacity
">

// Botón Secundario con glassmorphism y borde brillante
<button className="
  relative px-8 py-4 rounded-xl font-semibold
  bg-white/5 backdrop-blur-sm
  border border-white/10
  text-white
  hover:bg-white/10 hover:border-white/20
  hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
  transition-all duration-300
">
```

### 3. HEADER (`HeaderNav.tsx`)

```tsx
// Glassmorphism header
<header className="
  fixed top-0 w-full z-50
  bg-[var(--background)]/80 backdrop-blur-xl
  border-b border-white/[0.06]
">
  {/* Logo con glow en hover */}
  <div className="hover:drop-shadow-[0_0_8px_var(--primary)]">

  {/* Links con underline animado */}
  <a className="
    relative
    after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5
    after:bg-gradient-to-r after:from-blue-500 after:to-purple-500
    after:transition-all after:duration-300
    hover:after:w-full hover:after:left-0
  ">
```

### 4. CARDS Y SECCIONES (`FormSection.tsx`)

```tsx
// Card con borde gradiente sutil
<div className="
  relative p-6 rounded-2xl
  bg-[var(--surface)]
  border border-[var(--surface-border)]

  /* Borde gradiente en hover */
  before:absolute before:inset-0 before:rounded-2xl before:p-[1px]
  before:bg-gradient-to-r before:from-transparent before:via-blue-500/20 before:to-transparent
  before:opacity-0 hover:before:opacity-100
  before:transition-opacity before:duration-500

  /* Glow sutil */
  hover:shadow-[0_0_30px_-10px_var(--primary-glow)]
  transition-all duration-300
">
```

### 5. INPUTS (`StyledFormComponents.tsx`)

```tsx
// Input con focus glow
<input className="
  w-full px-4 py-3 rounded-xl
  bg-[var(--surface)]
  border border-[var(--surface-border)]
  text-[var(--foreground)]
  placeholder:text-[var(--foreground-muted)]

  /* Focus con ring glow */
  focus:outline-none
  focus:border-[var(--primary)]
  focus:ring-2 focus:ring-[var(--primary)]/20
  focus:shadow-[0_0_20px_-5px_var(--primary-glow)]

  transition-all duration-200
"/>
```

### 6. ANIMACIONES FRAMER MOTION

```tsx
// Stagger animation para listas
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }
  },
};

// Card hover con scale
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  transition={{ type: "spring", stiffness: 400, damping: 25 }}
>
```

### 7. EFECTOS ESPECIALES A IMPLEMENTAR

**A. Cursor Spotlight (Landing):**
```tsx
// Componente que sigue el cursor con un gradiente radial
const SpotlightCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // ... mouse move handler
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30"
      style={{
        background: `radial-gradient(600px at ${position.x}px ${position.y}px,
                     rgba(59, 130, 246, 0.06), transparent 80%)`
      }}
    />
  );
};
```

**B. Grid Pattern de Fondo:**
```tsx
// SVG grid con fade
<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center
                [mask-image:radial-gradient(white,transparent_70%)]" />
```

**C. Shimmer Loading:**
```css
.shimmer {
  background: linear-gradient(90deg,
    transparent,
    rgba(255,255,255,0.1),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

---

## ARCHIVOS NUEVOS A CREAR

```
src/components/effects/
├── SpotlightCursor.tsx    # Efecto cursor landing
├── GridPattern.tsx        # Grid de fondo
├── GradientBlob.tsx       # Blobs animados decorativos

src/components/ui/
├── GlowButton.tsx         # Botón con efecto glow
├── GlassCard.tsx          # Card con glassmorphism
├── AnimatedBorder.tsx     # Wrapper con borde animado
```

---

## RESTRICCIONES IMPORTANTES

1. **Performance**: Max 60fps, evitar animaciones pesadas en mobile
2. **Accesibilidad**: Mantener contraste WCAG AA (4.5:1 texto normal)
3. **Light Mode**: Los efectos deben verse bien también en light (más sutiles)
4. **Mobile**: Reducir/desactivar efectos pesados en pantallas pequeñas
5. **No romper**: La funcionalidad existente debe seguir funcionando

---

## VERIFICACIÓN FINAL

- [ ] Landing page tiene aspecto premium comparable a Vercel/Linear
- [ ] Dark mode es el protagonista pero light mode funciona
- [ ] Animaciones son suaves (60fps)
- [ ] Funciona en mobile sin lag
- [ ] Contraste accesible verificado
- [ ] No hay flasheo de tema al cargar

---

# ROADMAP DE MEJORAS (6 FASES)

## FASE 1: Fundación Visual y Dark Mode ✅ (COMPLETADA)

- [x] Sistema de colores en tailwind.config.ts
- [x] Variables CSS para temas en globals.css
- [x] Hook useTheme.ts
- [x] Componente ThemeToggle.tsx
- [x] Integración en HeaderNav

## FASE 2: Mejoras UX Step 1 - Carga de Datos

- [ ] Selector de modo de carga (API / Pegar / Archivo)
- [ ] Progress bar durante carga
- [ ] Validación en tiempo real

## FASE 3: Mejoras UX Step 2 - Formulario

- [ ] Progress ring (% completado)
- [ ] Validación con resumen de errores
- [ ] Tabs para móvil
- [ ] Bulk actions para tests

## FASE 4: Multi-Preview y Templates

- [ ] Tabs de preview (JIRA / Word / PDF / HTML)
- [ ] Exportación multi-formato
- [ ] Sistema de templates
- [ ] Edición inline en preview

## FASE 5: Integración API JIRA

- [ ] Autenticación OAuth 2.0
- [ ] Búsqueda avanzada de issues
- [ ] POST de comentarios a JIRA
- [ ] Sincronización bidireccional

## FASE 6: Funcionalidades Avanzadas

- [ ] Historial de reportes (IndexedDB)
- [ ] Dashboard de métricas
- [ ] Compartir reportes
- [ ] Keyboard shortcuts

---

## PRIORIDAD DE IMPLEMENTACIÓN

| Fase | Impacto | Esfuerzo | Prioridad |
|------|---------|----------|-----------|
| 1 - Visual/Dark Mode | Alto | Bajo | ⭐⭐⭐⭐⭐ |
| 2 - UX Step 1 | Medio | Medio | ⭐⭐⭐⭐ |
| 3 - UX Step 2 | Alto | Alto | ⭐⭐⭐⭐⭐ |
| 4 - Multi-Preview | Alto | Alto | ⭐⭐⭐⭐ |
| 5 - API JIRA | Muy Alto | Alto | ⭐⭐⭐⭐⭐ |
| 6 - Avanzadas | Medio | Medio | ⭐⭐⭐ |
