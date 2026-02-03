import { NextResponse } from 'next/server';
import { seedInitialUser } from '@/app/actions/auth';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
    try {
        // First, push the schema to create tables
        console.log('Pushing Prisma schema...');
        await execAsync('npx prisma db push --skip-generate');
        console.log('Schema pushed successfully');

        // Then seed the user
        const result = await seedInitialUser();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
