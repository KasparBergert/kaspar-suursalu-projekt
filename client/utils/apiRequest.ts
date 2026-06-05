const apiBaseUrl = 'http://localhost:3000/api';

type ApiRequestOptions = RequestInit;

export async function apiRequest<TData>(
    path: string,
    options: ApiRequestOptions = {},
): Promise<TData> {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
        throw new Error(data?.error ?? 'Request failed.');
    }

    return data as TData;
}
