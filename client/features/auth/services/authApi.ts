import type {
    AuthCredentials,
    AuthResult,
    AuthUser,
    PasswordResetPayload,
    PasswordResetRequestPayload,
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

export function requestPasswordReset(data: PasswordResetRequestPayload): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/password-resets', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function verifyPasswordResetToken(token: string): Promise<{ email: string }> {
    return apiRequest<{ email: string }>(`/auth/password-resets/${encodeURIComponent(token)}`);
}

export function resetPassword(
    token: string,
    data: PasswordResetPayload,
): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/auth/password-resets/${encodeURIComponent(token)}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
