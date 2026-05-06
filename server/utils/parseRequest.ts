import type { Request } from 'express';

export function parseQueryNumber(value: unknown): number {
    if (typeof value !== 'string') {
        return Number.NaN;
    }

    return Number(value);
}

export function parseRouteParam(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
}

export function getBearerToken(req: Request): string | undefined {
    const header = req.header('authorization');

    if (!header?.startsWith('Bearer ')) {
        return undefined;
    }

    return header.slice('Bearer '.length);
}
