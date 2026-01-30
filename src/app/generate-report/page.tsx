import { Suspense } from 'react';
import HeaderNav from "@/components/HeaderNav";
import FooterNav from "@/components/FooterNav";
import GenerateReportWorkflow from '@/components/GenerateReportWorkflow'; // Ajusta la ruta si es diferente

// Un componente simple para el fallback de Suspense
function LoadingWorkflowFallback() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]"> {/* Ajusta altura según necesites */}
      <p className="text-xl text-[var(--foreground-secondary)]">Cargando generador de reportes...</p>
      {/* Aquí podrías poner un spinner más elaborado si quieres */}
    </div>
  );
}

export default function GenerateReportPage() {
  return (
    <>
      <HeaderNav />
      <main className="pt-20 min-h-screen bg-[var(--background)] relative">
        <Suspense fallback={<LoadingWorkflowFallback />}>
          <GenerateReportWorkflow />
        </Suspense>
      </main>
      <FooterNav />
    </>
  );
}