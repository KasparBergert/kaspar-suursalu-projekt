import { afterEach, describe, expect, it } from 'vitest';
import prisma from '../../server/prisma/main.ts';
import { AuthService } from '../../server/services/AuthService.ts';
import type {
    AuthUser,
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
    async create(user: AuthUser): Promise<string> {
        return `token:${user.id}`;
    }

    async validate(token: string): Promise<AuthUser> {
        const id = token.replace('token:', '');

        return {
            id,
            name: 'Integration User',
            email: 'integration@example.com',
        };
    }
}

function createAuthService(): AuthService {
    return new AuthService(
        new IntegrationPasswordHasher(),
        new IntegrationTokenService(),
    );
}

function createEmail(): string {
    const email = `auth-${crypto.randomUUID()}@example.com`;
    createdEmails.push(email);

    return email;
}

describe('AuthService integration', () => {
    afterEach(async () => {
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
});
