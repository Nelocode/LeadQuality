import { NextRequest, NextResponse } from 'next/server';
import { processNewLead } from '@/lib/leads';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate basic body structure? 
        // For now we accept any JSON as we store rawData and let IA handle it mainly.
        // Ideally we expect "source" in body or query param. or infer from body.

        const { searchParams } = new URL(req.url);
        const sourceParam = searchParams.get('source');
        const source = sourceParam || body.source || 'Webhook';

        const lead = await processNewLead(body, source);

        return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
    } catch (error) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
