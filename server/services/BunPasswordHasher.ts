import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { PasswordHasher } from '../interfaces/UserInterfaces.ts';

const nodeHashPrefix = 'scrypt';
const nodeKeyLength = 64;

export class BunPasswordHasher implements PasswordHasher {
    async hash(password: string): Promise<string> {
        if (typeof Bun === 'undefined') {
            const salt = randomBytes(16).toString('hex');
            const hash = scryptSync(password, salt, nodeKeyLength).toString('hex');

            return `${nodeHashPrefix}$${salt}$${hash}`;
        }

        return Bun.password.hash(password);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        if (hashedPassword.startsWith(`${nodeHashPrefix}$`)) {
            const [, salt, hash] = hashedPassword.split('$');

            if (!salt || !hash) {
                return false;
            }

            const expectedHash = Buffer.from(hash, 'hex');
            const actualHash = scryptSync(password, salt, expectedHash.length);

            return expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
        }

        if (typeof Bun === 'undefined') {
            return false;
        }

        return Bun.password.verify(password, hashedPassword);
    }
}
