# Generador de Reportes JIRA

Este proyecto es una aplicación creada con [Next.js](https://nextjs.org), pensada para generar reportes profesionales a partir de contenido extraído de JIRA.

## Características Principales

- **Ingreso de Contenido (Paso 1)**: Copia y pega el texto relevante de tu ticket/incidencia de JIRA.
- **Datos Adicionales (Paso 2)**: Configura versiones, entorno de pruebas, batería de casos de prueba, incidencias y más.
- **Revisión del Reporte (Paso 3)**: Visualiza el reporte final en formato Markdown, con posibilidad de:
  - Copiar el reporte al portapapeles.
  - Exportar a Word (.docx) con tablas nativas.
  - Reiniciar el proceso para generar un nuevo reporte.
- **Botón Flotante de Feedback + Bugs**: Envía sugerencias o reportes de incidencias; se almacenan en localStorage.
- **Secciones de Ayuda y Release Notes**:
  - **Ayuda**: Explica en detalle el uso de la aplicación y los pasos para generar un reporte.
  - **Release Notes**: Muestra los cambios y mejoras de cada versión publicada.

## Requisitos Previos

- Node.js 16 o superior.
- npm, yarn, pnpm o bun para instalar dependencias y correr el proyecto.

## Puesta en Marcha

1. **Clonar el Repositorio**:
```

git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo

```

2. **Instalar Dependencias**:
```

npm install

```

3. **Ejecución del Servidor de Desarrollo**:
Inicia el servidor de desarrollo:
```

npm run dev

```
Abre http://localhost:3000 en tu navegador para ver la aplicación en funcionamiento.

## Estructura de la Aplicación

- **app/page.tsx**: Página principal que contiene los 3 pasos del proceso de generación del reporte y muestra el botón flotante de Feedback.
- **app/help/page.tsx**: Página de Ayuda con instrucciones detalladas sobre el uso de la herramienta.
- **app/release-notes/page.tsx**: Página de Release Notes, que muestra las novedades de cada versión.
- **components/HeaderNav.tsx**: Encabezado fijo con navegación a Inicio, Ayuda y Release Notes.
- **components/Footer.tsx**: (Opcional) Pie de página con enlaces e información de copyright.
- **components/StepOnePaste.tsx**: Componente para el Paso 1, donde se ingresa el contenido de JIRA.
- **components/StepTwoForm.tsx**: Componente para el Paso 2, donde se configuran datos adicionales.
- **components/ReportOutput.tsx**: Componente para el Paso 3, que permite revisar y exportar el reporte.
- **components/Feedback.tsx**: Botón flotante y modal para enviar sugerencias o reportar bugs (almacena en localStorage).

## Uso de la Aplicación

### Paso 1: Ingreso del Contenido del JIRA
Pega el contenido relevante de tu ticket o incidencia JIRA en el área designada.
Haz clic en el botón Generar para avanzar al siguiente paso.

### Paso 2: Datos Adicionales
Completa los campos adicionales: fecha de prueba, tester, estado de la prueba, versiones del sistema, entorno, batería de casos de prueba, incidencias, etc.
Una vez completados, presiona Generar Reporte para pasar al Paso 3.

### Paso 3: Revisión del Reporte
Visualiza el reporte final en formato Markdown.
Opciones disponibles:
- Copiar al Portapapeles: Copia el reporte en texto plano para usarlo en otras aplicaciones.
- Exportar: Genera un archivo Word (.docx) con tablas nativas.
- Reiniciar: Limpia todos los campos para comenzar nuevamente.

### Feedback + Bugs
Un botón flotante situado en la esquina inferior derecha permite enviar sugerencias o reportar bugs.
Al hacer clic, se abre un modal para introducir tu nombre y la descripción del feedback.
Los reportes se almacenan localmente (localStorage) y se pueden consultar en la misma interfaz.

### Páginas de Ayuda y Release Notes
- **Ayuda**: En la página /help encontrarás una guía detallada paso a paso, con tips de uso e instrucciones para solucionar dudas.
- **Release Notes**: La página /release-notes muestra las novedades y mejoras de cada versión.
Ejemplo: Versión 1.0.0 – Actualización: Marzo 2025

## Recursos Adicionales
Para aprender más sobre Next.js, consulta:

- Documentación de Next.js
- Tutorial Interactivo de Next.js
También puedes explorar el repositorio de Next.js en GitHub para contribuir o reportar issues.

## Despliegue en Vercel
La forma más sencilla de desplegar esta aplicación es usar la plataforma de Vercel. Consulta la documentación de despliegue de Next.js para más detalles.

&copy; 2025 ETRA I+D  
Todos los derechos reservados.

Si necesitas más información o deseas contribuir, abre un issue o envía un pull request. ¡Gracias por usar el Generador de Reportes JIRA!
```
