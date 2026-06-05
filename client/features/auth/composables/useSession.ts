import { computed, ref } from 'vue';
import {
    clearStoredSession,
    readStoredUser,
    storeUser,
} from '../services/sessionStorage.ts';
import type { AuthUser } from '../../../types.ts';

export function useSession() {
    const user = ref<AuthUser | null>(readStoredUser());
    const isAuthenticated = computed(() => Boolean(user.value));

    function setSession(nextUser: AuthUser): void {
        user.value = nextUser;
        storeUser(nextUser);
    }

    function updateUser(nextUser: AuthUser): void {
        user.value = nextUser;
        storeUser(nextUser);
    }

    function clearSession(): void {
        user.value = null;
        clearStoredSession();
    }

    return {
        clearSession,
        isAuthenticated,
        setSession,
        updateUser,
        user,
    };
}
