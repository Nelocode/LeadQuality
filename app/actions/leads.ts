'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { processNewLead } from '@/lib/leads';

export async function deleteLead(leadId: number) {
    try {
        await prisma.lead.delete({
            where: { id: leadId }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting lead:', error);
        return { success: false, error: 'Error al eliminar el lead' };
    }
}

export async function deleteAllLeads() {
    try {
        await prisma.lead.deleteMany({});

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Error deleting all leads:', error);
        return { success: false, error: 'Error al eliminar los leads' };
    }
}

interface ManualLeadData {
    name: string;
    email?: string;
    phone?: string;
    source?: string;
    company?: string;
    role?: string;
    address?: string;
    city?: string;
}

export async function addManualLead(data: ManualLeadData) {
    try {
        const lead = await processNewLead(data, data.source || 'Manual');
        revalidatePath('/');
        return { success: true, lead };
    } catch (error) {
        console.error('Error adding manual lead:', error);
        return { success: false, error: 'Error al agregar el lead' };
    }
}

export async function updateLead(leadId: number, data: Partial<ManualLeadData & { status: string }>) {
    try {
        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                company: data.company,
                role: data.role,
                address: data.address,
                city: data.city,
                status: data.status
            }
        });

        revalidatePath('/');
        return { success: true, lead: updatedLead };
    } catch (error) {
        console.error('Error updating lead:', error);
        return { success: false, error: 'Error al actualizar el lead' };
    }
}
