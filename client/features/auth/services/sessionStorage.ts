import type { AuthUser } from '../../../types.ts';

const tokenStorageKey = 'quora-copy-token';
const userStorageKey = 'quora-copy-user';

export function readStoredToken(): string {
    return localStorage.getItem(tokenStorageKey) ?? '';
}

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

export function storeSession(token: string, user: AuthUser): void {
    localStorage.setItem(tokenStorageKey, token);
    localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function storeUser(user: AuthUser): void {
    localStorage.setItem(userStorageKey, JSON.stringify(user));
}

export function clearStoredSession(): void {
    localStorage.removeItem(tokenStorageKey);
    localStorage.removeItem(userStorageKey);
}
