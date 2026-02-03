import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        // Create tables using raw SQL for SQLite
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "Lead" (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "source" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "email" TEXT,
                "phone" TEXT,
                "company" TEXT,
                "role" TEXT,
                "address" TEXT,
                "city" TEXT,
                "rawData" TEXT NOT NULL,
                "initialScore" INTEGER NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'Nuevo',
                "notes" TEXT
            )
        `);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "SystemConfig" (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "key" TEXT NOT NULL UNIQUE,
                "value" TEXT NOT NULL
            )
        `);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "email" TEXT NOT NULL UNIQUE,
                "name" TEXT,
                "password" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'user',
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL
            )
        `);

        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "PasswordResetToken" (
                "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                "email" TEXT NOT NULL,
                "token" TEXT NOT NULL UNIQUE,
                "expiresAt" DATETIME NOT NULL,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Tables created successfully');

        // Check if admin user exists
        const existingUser = await prisma.$queryRawUnsafe(`
            SELECT * FROM "User" WHERE email = 'admin@leadquality.com' LIMIT 1
        `) as any[];

        if (existingUser.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const now = new Date().toISOString();

            await prisma.$executeRawUnsafe(`
                INSERT INTO "User" (email, name, password, role, createdAt, updatedAt)
                VALUES ('admin@leadquality.com', 'Admin', '${hashedPassword}', 'admin', '${now}', '${now}')
            `);

            return NextResponse.json({
                success: true,
                message: 'Database initialized and admin user created',
                credentials: {
                    email: 'admin@leadquality.com',
                    password: 'admin123'
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Database already initialized, admin user exists'
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
