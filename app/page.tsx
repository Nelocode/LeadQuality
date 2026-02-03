import { prisma } from '@/lib/prisma';
import { LeadTable } from '@/components/LeadTable';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import Link from 'next/link';
import { Settings, BarChart3, Globe } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Navbar / Header */}
      <header className="border-b border-brand/20 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <img src="/logo-cntxt.png" alt="CNTXT" className="h-8 w-auto" />
              <sup className="text-[10px] text-zinc-400 ml-0.5">®</sup>
            </div>
            <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700"></div>
            <h1 className="text-xl font-light tracking-wide">
              LEAD<span className="font-bold text-brand">QUALITY</span>
            </h1>
          </div>

          <nav className="flex gap-4">
            <Link href="/webhooks" className="flex items-center gap-2 text-sm hover:text-brand transition-colors">
              <Globe size={16} /> Webhooks
            </Link>
            <Link href="/analysis" className="flex items-center gap-2 text-sm hover:text-brand transition-colors">
              <BarChart3 size={16} /> Análisis
            </Link>
            <Link href="/settings" className="flex items-center gap-2 text-sm hover:text-brand transition-colors">
              <Settings size={16} /> Configuración
            </Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light mb-2">Panel de Control</h2>
          <p className="text-zinc-500 font-light">
            Gestiona y califica tus prospectos en tiempo real con Inteligencia Artificial.
          </p>
        </div>

        <LeadTable initialLeads={leads} />

        <AnalyticsDashboard />
      </div>
    </main>
  );
}
