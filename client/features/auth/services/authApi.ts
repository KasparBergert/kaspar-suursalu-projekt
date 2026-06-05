import type {
    AuthCredentials,
    AuthUser,
    PasswordResetPayload,
    PasswordResetRequestPayload,
    RegisterPayload,
} from '../../../types.ts';
import { apiRequest } from '../../../utils/apiRequest.ts';

export function register(data: RegisterPayload): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function login(data: AuthCredentials): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export function logout(): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
    });
}

export function getProfile(): Promise<{ user: AuthUser }> {
    return apiRequest<{ user: AuthUser }>('/profile');
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

export function verifyCurrentPasswordReset(): Promise<{ email: string }> {
    return apiRequest<{ email: string }>('/auth/password-resets/current');
}

export function resetPassword(
    data: PasswordResetPayload,
): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/password-resets/current', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
