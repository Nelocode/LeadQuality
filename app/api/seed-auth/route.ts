import { NextResponse } from 'next/server';
import { seedInitialUser } from '@/app/actions/auth';

export async function GET() {
    const result = await seedInitialUser();
    return NextResponse.json(result);
}
