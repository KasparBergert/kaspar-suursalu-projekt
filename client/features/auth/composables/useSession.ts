import { computed, ref } from 'vue';
import {
    clearStoredSession,
    readStoredToken,
    readStoredUser,
    storeSession,
    storeUser,
} from '../services/sessionStorage.ts';
import type { AuthUser } from '../../../types.ts';

export function useSession() {
    const token = ref(readStoredToken());
    const user = ref<AuthUser | null>(readStoredUser());
    const isAuthenticated = computed(() => Boolean(token.value && user.value));

    function setSession(nextToken: string, nextUser: AuthUser): void {
        token.value = nextToken;
        user.value = nextUser;
        storeSession(nextToken, nextUser);
    }

    function updateUser(nextUser: AuthUser): void {
        user.value = nextUser;
        storeUser(nextUser);
    }

    function clearSession(): void {
        token.value = '';
        user.value = null;
        clearStoredSession();
    }

    return {
        clearSession,
        isAuthenticated,
        setSession,
        token,
        updateUser,
        user,
    };
}
