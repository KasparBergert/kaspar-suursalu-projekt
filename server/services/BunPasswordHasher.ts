import type { PasswordHasher } from '../interfaces/UserInterfaces.ts';

export class BunPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        return Bun.password.hash(password);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return Bun.password.verify(password, hashedPassword);
    }
}
