import { beforeEach, describe, expect, it, vi } from 'vitest';

const prisma = vi.hoisted(() => ({
    users: {
        findUnique: vi.fn(),
        create: vi.fn(),
    },
}));

vi.mock('../../server/prisma/main.ts', () => ({
    default: prisma,
}));

import { AuthService } from '../../server/services/AuthService.ts';
import type {
    PasswordHasher,
    TokenService,
} from '../../server/interfaces/UserInterfaces.ts';

const user = {
    id: 'user-1',
    name: 'Kaspar',
    email: 'kaspar@example.com',
    password: 'hashed-password',
};

function createAuthService(passwordMatches = true): AuthService {
    const passwordHasher: PasswordHasher = {
        hash: vi.fn(async () => 'hashed-password'),
        compare: vi.fn(async () => passwordMatches),
    };

    const tokenService: TokenService = {
        create: vi.fn(async () => 'jwt-token'),
        validate: vi.fn(),
        reset: vi.fn(),
    };

    return new AuthService(passwordHasher, tokenService);
}

function createAuthServiceWithTokenService(tokenService: TokenService): AuthService {
    const passwordHasher: PasswordHasher = {
        hash: vi.fn(),
        compare: vi.fn(),
    };

    return new AuthService(passwordHasher, tokenService);
}

describe('AuthService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('registers a new user and returns a login token', async () => {
        prisma.users.findUnique.mockResolvedValue(null);
        prisma.users.create.mockResolvedValue(user);

        const result = await createAuthService().register({
            name: 'Kaspar',
            email: 'kaspar@example.com',
            password: 'password123',
        });

        expect(result).toEqual({
            user: {
                id: 'user-1',
                name: 'Kaspar',
                email: 'kaspar@example.com',
            },
            token: 'jwt-token',
        });
    });

    it('does not register an email that already belongs to a user', async () => {
        prisma.users.findUnique.mockResolvedValue(user);

        await expect(createAuthService().register({
            name: 'Kaspar',
            email: 'kaspar@example.com',
            password: 'password123',
        })).rejects.toThrow('Email is already registered.');
    });

    it('logs in a user with a matching password', async () => {
        prisma.users.findUnique.mockResolvedValue(user);

        const result = await createAuthService().login({
            email: 'kaspar@example.com',
            password: 'password123',
        });

        expect(result.token).toBe('jwt-token');
    });

    it('does not log in a user with a wrong password', async () => {
        prisma.users.findUnique.mockResolvedValue(user);

        await expect(createAuthService(false).login({
            email: 'kaspar@example.com',
            password: 'password123',
        })).rejects.toThrow('Email or password is incorrect.');
    });

    it('logs out by resetting the given token', async () => {
        const tokenService: TokenService = {
            create: vi.fn(),
            validate: vi.fn(),
            reset: vi.fn(),
        };

        await createAuthServiceWithTokenService(tokenService).logout('jwt-token');

        expect(tokenService.reset).toHaveBeenCalledWith('jwt-token');
    });
});
