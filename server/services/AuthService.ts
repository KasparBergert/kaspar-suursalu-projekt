import { assertAuthUser } from '../assertions/UserAssertions.ts';
import type {
    AuthResult,
    EmailService,
    PasswordHasher,
    TokenService,
} from '../interfaces/UserInterfaces.ts';
import prisma from '../prisma/main.ts';
import type { UsersModel } from '../prisma/generated/models/Users.ts';
import {
    assertLoginData,
    assertPasswordResetData,
    assertPasswordResetRequestData,
    assertRegisterData,
} from '../validators/UserValidator.ts';

const resetTokenLifetimeMs = 1000 * 60 * 30;

export class AuthService {
    constructor(
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService,
        private readonly emailService?: EmailService,
    ) {}

    async register(data: unknown): Promise<AuthResult> {
        assertRegisterData(data);
        
        const existingUser = await prisma.users.findUnique({
            where: {
                email: data.email,
            },
        });
        
        if (existingUser) {
            throw new Error('Email is already registered.');
        }

        const hashedPassword = await this.passwordHasher.hash(data.password);

        const user = await prisma.users.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
        });

        return this.createAuthResult(user);
    }

    async login(data: unknown): Promise<AuthResult> {
        assertLoginData(data);

        const user = await prisma.users.findUnique({
            where: {
                email: data.email,
            },
        });

        if (!user) {
            throw new Error('Email or password is incorrect.');
        }

        const passwordIsCorrect = await this.passwordHasher.compare(
            data.password,
            user.password,
        );

        if (!passwordIsCorrect) {
            throw new Error('Email or password is incorrect.');
        }

        return this.createAuthResult(user);
    }

    async logout(token: string): Promise<void> {
        await this.tokenService.reset(token);
    }

    async requestPasswordReset(data: unknown): Promise<{ message: string }> {
        assertPasswordResetRequestData(data);

        const user = await prisma.users.findUnique({
            where: {
                email: data.email,
            },
        });

        if (user) {
            const token = crypto.randomUUID();
            await prisma.pendingPasswordReset.create({
                data: {
                    email: data.email,
                    token,
                    expiresAt: new Date(Date.now() + resetTokenLifetimeMs),
                },
            });

            await this.emailService?.sendPasswordReset(
                data.email,
                this.createPasswordResetUrl(token),
            );
        }

        return {
            message: 'If that email exists, a password reset link has been sent.',
        };
    }

    async verifyPasswordResetToken(token: string): Promise<{ email: string }> {
        const reset = await this.findActivePasswordReset(token);

        return {
            email: reset.email,
        };
    }

    async resetPassword(token: string, data: unknown): Promise<{ message: string }> {
        assertPasswordResetData(data);

        const reset = await this.findActivePasswordReset(token);
        const hashedPassword = await this.passwordHasher.hash(data.password);

        await prisma.$transaction(async (tx) => {
            await tx.users.update({
                where: {
                    email: reset.email,
                },
                data: {
                    password: hashedPassword,
                },
            });

            await tx.pendingPasswordReset.delete({
                where: {
                    token,
                },
            });
        });

        return {
            message: 'Password has been reset.',
        };
    }

    private async createAuthResult(user: UsersModel): Promise<AuthResult> {
        const authUser = {
            id: user.id,
            name: user.name,
            email: user.email,
        };

        assertAuthUser(authUser);

        const token = await this.tokenService.create(authUser);

        return {
            user: authUser,
            token,
        };
    }

    private async findActivePasswordReset(token: string) {
        const reset = await prisma.pendingPasswordReset.findUnique({
            where: {
                token,
            },
        });

        if (!reset || reset.expiresAt.getTime() < Date.now()) {
            throw new Error('Password reset link is invalid or expired.');
        }

        return reset;
    }

    private createPasswordResetUrl(token: string): string {
        const frontendUrl = process.env.FRONTEND_URL ?? 'http://127.0.0.1:5173';

        return `${frontendUrl}/?resetToken=${encodeURIComponent(token)}`;
    }
}
