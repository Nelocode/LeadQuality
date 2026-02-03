import { prisma } from './prisma';
import { qualifyLead } from './ai';

const DEFAULT_PROMPT = "Analiza el lead. Si tiene nombre completo, email y teléfono suma 50 puntos. Si el email parece corporativo suma 20 puntos. Si menciona interés explícito suma 30 puntos.";

export interface LeadInput {
    name: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    address?: string;
    city?: string;
    [key: string]: any;
}

export async function processNewLead(data: LeadInput, source: string) {
    // 1. Get Prompt
    let config = await prisma.systemConfig.findUnique({ where: { key: 'scoring_prompt' } });

    if (!config) {
        try {
            config = await prisma.systemConfig.create({
                data: { key: 'scoring_prompt', value: DEFAULT_PROMPT }
            });
        } catch (e) {
            config = await prisma.systemConfig.findUnique({ where: { key: 'scoring_prompt' } });
        }
    }

    const promptToUse = config?.value || DEFAULT_PROMPT;

    // 2. Qualify
    const qualification = await qualifyLead(data, promptToUse);

    // 3. Save
    const savedLead = await prisma.lead.create({
        data: {
            source,
            name: data.name || 'Desconocido',
            email: data.email || null,
            phone: data.phone || null,
            company: data.company || null,
            role: data.role || null,
            address: data.address || null,
            city: data.city || null,
            rawData: JSON.stringify(data),
            initialScore: qualification.score,
            notes: qualification.reason,
            status: 'Nuevo'
        }
    });

    // 4. Trigger Outgoing Webhook (Fire and Forget)
    try {
        const webhookConfig = await prisma.systemConfig.findUnique({ where: { key: 'n8n_webhook_url' } });
        const webhookUrl = webhookConfig?.value;

        if (webhookUrl) {
            fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(savedLead)
            }).catch(err => console.error("Error sending to n8n webhook:", err));
        }
    } catch (e) {
        console.error("Error triggering webhook flow:", e);
    }

    return savedLead;
}
