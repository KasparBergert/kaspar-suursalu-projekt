import type { AuthUser } from '../../../types.ts';

const userStorageKey = 'quora-copy-user';

export function readStoredUser(): AuthUser | null {
    const value = localStorage.getItem(userStorageKey);

    if (!value) {
        return null;
    }

    try {
        return JSON.parse(value) as AuthUser;
    } catch {
        localStorage.removeItem(userStorageKey);
        return null;
    }
}

export function storeUser(user: AuthUser): void {
    localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function clearStoredSession(): void {
    localStorage.removeItem(userStorageKey);
}
