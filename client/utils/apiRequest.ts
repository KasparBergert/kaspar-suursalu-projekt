const apiBaseUrl = 'http://localhost:3000/api';

type ApiRequestOptions = RequestInit & {
    token?: string;
};

export async function apiRequest<TData>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<TData> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    if (options.token) {
        headers.set('Authorization', `Bearer ${options.token}`);
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.error ?? 'Request failed.');
    }

    return data as TData;
}
