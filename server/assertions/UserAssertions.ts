import type { AuthUser } from '../interfaces/UserInterfaces.ts';
import { isObject } from '../utils/isObject.ts';

export function assertAuthUser(user: unknown): asserts user is AuthUser {
    if (!isObject(user)) {
        throw new Error('User must be an object.');
    }

    if (typeof user.id !== 'string') {
        throw new Error('User id must be a string.');
    }

    if (typeof user.name !== 'string') {
        throw new Error('User name must be a string.');
    }

    if (typeof user.email !== 'string') {
        throw new Error('User email must be a string.');
    }
}
