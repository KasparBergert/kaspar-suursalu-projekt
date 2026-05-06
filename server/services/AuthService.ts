import { assertAuthUser } from '../assertions/UserAssertions.ts';
import type {
    AuthResult,
    PasswordHasher,
    TokenService,
} from '../interfaces/UserInterfaces.ts';
import prisma from '../prisma/main.ts';
import type { UsersModel } from '../prisma/generated/models/Users.ts';
import {
    assertLoginData,
    assertRegisterData,
} from '../validators/UserValidator.ts';

export class AuthService {
    constructor(
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService,
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
}
