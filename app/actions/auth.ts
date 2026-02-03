'use server'

import { prisma } from '@/lib/prisma';
import { login, logout } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function loginAction(data: any) {
    const { email, password } = data;

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        // Create session
        await login({ id: user.id, email: user.email, name: user.name, role: user.role });

        return { success: true };

    } catch (error) {
        console.error('Login error', error);
        return { success: false, error: 'Error del servidor' };
    }
}

export async function logoutAction() {
    await logout();
    redirect('/login');
}

// Auxiliar: Solo para llamar manualmente una vez
export async function seedInitialUser() {
    const email = 'nelsondcarvajal@gmail.com';
    const password = 'Lancelot.012025';

    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert admin user
    try {
        await prisma.user.upsert({
            where: { email },
            update: { password: hashedPassword, role: 'admin' },
            create: {
                email,
                name: 'Nelson Carvajal',
                password: hashedPassword,
                role: 'admin'
            }
        });
        console.log('Seed user created/updated successfully');
        return { success: true, message: 'Usuario creado exitosamente' };
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}

export async function createUser(data: any) {
    // Only admin usually, but we check specific session inside or assume middleware/page checks
    const { name, email, password, role } = data;

    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return { success: false, error: 'El email ya está registrado' };

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'user'
            }
        });
        revalidatePath('/settings/users');
        return { success: true };
    } catch (e) {
        return { success: false, error: 'Error al crear usuario' };
    }
}

export async function requestPasswordReset(email: string) {
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        // Security: Always return success even if email doesn't exist to prevent enumeration
        if (!user) return { success: true };

        const token = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

        await prisma.passwordResetToken.create({
            data: {
                email,
                token,
                expiresAt
            }
        });

        // MOCK EMAIL SENDING
        console.log(`[EMAIL MOCK] Password Reset Requested for ${email}. Link: ${process.env.APP_URL}/reset-password?token=${token}`);
        console.log(`[EMAIL MOCK] Notification sent to nelsondcarvajal@gmail.com`);

        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: 'Error al procesar solicitud' };
    }
}
