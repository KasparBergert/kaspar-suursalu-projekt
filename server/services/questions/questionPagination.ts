export const questionsPageLimit = 10;

export function normalizePage(page: number): number {
    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

export function normalizeLimit(limit: number): number {
    if (!Number.isInteger(limit) || limit < 1) {
        return 10;
    }

    return Math.min(limit, 50);
}

export function getTotalPages(total: number, limit: number): number {
    return Math.ceil(total / limit);
}
