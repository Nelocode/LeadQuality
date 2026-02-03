'use server'
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
    const prompt = formData.get('prompt') as string;
    const webhookUrl = formData.get('n8n_webhook_url') as string;

    try {
        if (prompt) {
            await prisma.systemConfig.upsert({
                where: { key: 'scoring_prompt' },
                update: { value: prompt },
                create: { key: 'scoring_prompt', value: prompt }
            });
        }

        if (webhookUrl !== null) { // Allow empty string to clear it
            await prisma.systemConfig.upsert({
                where: { key: 'n8n_webhook_url' },
                update: { value: webhookUrl },
                create: { key: 'n8n_webhook_url', value: webhookUrl }
            });
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Error updating settings' };
    }
}
