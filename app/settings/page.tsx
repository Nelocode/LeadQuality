import { prisma } from '@/lib/prisma';
import { updateSettings } from '@/app/actions/settings';
import Link from 'next/link';
import { ArrowLeft, Save, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const promptConfig = await prisma.systemConfig.findUnique({ where: { key: 'scoring_prompt' } });

    const currentPrompt = promptConfig?.value || "Analiza el lead. Si tiene nombre completo, email y teléfono suma 50 puntos. Si el email parece corporativo suma 20 puntos. Si menciona interés explícito suma 30 puntos.";

    async function action(formData: FormData) {
        'use server'
        await updateSettings(formData);
    }

    return (
        <main className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-brand mb-8 transition-colors">
                    <ArrowLeft size={18} /> Volver al Inicio
                </Link>

                <h1 className="text-3xl font-light mb-8">Configuración de <span className="text-brand font-semibold">Calificación</span></h1>

                <div className="space-y-8">
                    {/* Main Config Form */}
                    <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 md:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand"></div>

                        <form action={action} className="space-y-8">

                            {/* Prompt Section */}
                            <div>
                                <h2 className="text-xl font-medium mb-4">Prompt del Sistema</h2>
                                <p className="text-zinc-500 mb-4 text-sm">
                                    Define aquí las instrucciones que la Inteligencia Artificial debe seguir para puntuar a cada lead entrante.
                                </p>
                                <textarea
                                    name="prompt"
                                    className="w-full h-48 p-4 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black font-mono text-sm outline-none focus:border-brand transition-colors resize-y"
                                    defaultValue={currentPrompt}
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-brand text-white px-6 py-2.5 rounded shadow hover:bg-amber-600 transition-colors font-medium"
                                >
                                    <Save size={18} />
                                    Guardar Configuración
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Users Section (Admin Only) */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/settings/users" className="group block p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-brand transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                            <Users size={20} />
                        </div>
                        <h3 className="font-semibold text-lg">Gestión de Usuarios</h3>
                    </div>
                    <p className="text-zinc-500 text-sm">
                        Administra cuentas de acceso, crea nuevos usuarios y restablece contraseñas.
                    </p>
                </Link>
            </div>
        </main>
    );
}
