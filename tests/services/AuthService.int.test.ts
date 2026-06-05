import { afterEach, describe, expect, it } from 'vitest';
import prisma from '../../server/prisma/main.ts';
import { AuthService } from '../../server/services/AuthService.ts';
import type {
    AuthUser,
    EmailService,
    PasswordHasher,
    TokenService,
} from '../../server/interfaces/UserInterfaces.ts';

const createdEmails: string[] = [];

class IntegrationPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        return `hashed:${password}`;
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return hashedPassword === `hashed:${password}`;
    }
}

class IntegrationTokenService implements TokenService {
    private readonly resetTokens = new Set<string>();

    async create(user: AuthUser): Promise<string> {
        return `token:${user.id}`;
    }

    async validate(token: string): Promise<AuthUser> {
        if (this.resetTokens.has(token)) {
            throw new Error('Token has been reset.');
        }

        const id = token.replace('token:', '');

        return {
            id,
            name: 'Integration User',
            email: 'integration@example.com',
        };
    }

    async reset(token: string): Promise<void> {
        await this.validate(token);
        this.resetTokens.add(token);
    }
}

class IntegrationEmailService implements EmailService {
    resetLinks: string[] = [];

    async sendPasswordReset(_email: string, resetUrl: string): Promise<void> {
        this.resetLinks.push(resetUrl);
    }
}

function createAuthService(emailService?: EmailService): AuthService {
    return new AuthService(
        new IntegrationPasswordHasher(),
        new IntegrationTokenService(),
        emailService,
    );
}

function createEmail(): string {
    const email = `auth-${crypto.randomUUID()}@example.com`;
    createdEmails.push(email);

    return email;
}

describe('AuthService integration', () => {
    afterEach(async () => {
    await prisma.commentUpvotes.deleteMany({});
    await prisma.questionUpvotes.deleteMany({});
    await prisma.pendingPasswordReset.deleteMany({});
        await prisma.comments.deleteMany({});
        await prisma.questions.deleteMany({});
        await prisma.users.deleteMany({});
        createdEmails.length = 0;
    });

    it('registers a user with a stored hashed password', async () => {
        const email = createEmail();

        const result = await createAuthService().register({
            name: 'Integration User',
            email,
            password: 'password123',
        });
        const user = await prisma.users.findUnique({ where: { email } });

        expect(result.token).toBe(`token:${result.user.id}`);
        expect(user?.password).toBe('hashed:password123');
    });

    it('does not register two users with the same email', async () => {
        const email = createEmail();
        await createAuthService().register({
            name: 'Integration User',
            email,
            password: 'password123',
        });

        await expect(createAuthService().register({
            name: 'Other User',
            email,
            password: 'password123',
        })).rejects.toThrow('Email is already registered.');
    });

    it('logs in a registered user', async () => {
        const email = createEmail();
        await createAuthService().register({
            name: 'Integration User',
            email,
            password: 'password123',
        });

        const result = await createAuthService().login({
            email,
            password: 'password123',
        });

        expect(result.user.email).toBe(email);
    });

    it('resets a password through a one-time emailed link', async () => {
        const email = createEmail();
        const emailService = new IntegrationEmailService();
        const authService = createAuthService(emailService);
        await authService.register({
            name: 'Integration User',
            email,
            password: 'password123',
        });

        const resetRequest = await authService.requestPasswordReset({ email });
        expect(emailService.resetLinks[0]).toEqual(expect.any(String));
        const resetUrl = new URL(emailService.resetLinks[0] as string);
        const token = resetUrl.pathname.split('/').at(-2);

        expect(resetRequest).toEqual({
            message: 'If that email exists, a password reset link has been sent.',
        });
        expect(token).toEqual(expect.any(String));
        await expect(authService.verifyPasswordResetToken(token ?? '')).resolves.toEqual({ email });

        await authService.resetPassword(token ?? '', {
            password: 'new-password123',
        });

        await expect(authService.login({
            email,
            password: 'password123',
        })).rejects.toThrow('Email or password is incorrect.');
        await expect(authService.login({
            email,
            password: 'new-password123',
        })).resolves.toMatchObject({
            user: { email },
        });
        await expect(authService.verifyPasswordResetToken(token ?? ''))
            .rejects.toThrow('Password reset link is invalid or expired.');
    });
});
