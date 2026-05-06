import type {
    AuthCredentials,
    AuthResult,
    AuthUser,
    RegisterPayload,
} from '../../../types.ts';
import { apiRequest } from '../../../utils/apiRequest.ts';

export function register(data: RegisterPayload): Promise<AuthResult> {
    return apiRequest<AuthResult>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function login(data: AuthCredentials): Promise<AuthResult> {
    return apiRequest<AuthResult>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function logout(token: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
        token,
    });
}

export function getProfile(token: string): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>('/profile', { token });
}
