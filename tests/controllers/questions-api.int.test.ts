import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../server/app.ts';
import prisma from '../../server/prisma/main.ts';

let server: Server;
let baseUrl: string;

async function clearDatabase(): Promise<void> {
    await prisma.questionUpvotes.deleteMany({});
    await prisma.pendingPasswordReset.deleteMany({});
    await prisma.comments.deleteMany({});
    await prisma.questions.deleteMany({});
    await prisma.users.deleteMany({});
}

async function startServer(): Promise<void> {
    await new Promise<void>((resolve) => {
        server = createApp().listen(0, '127.0.0.1', () => {
            const address = server.address() as AddressInfo;
            baseUrl = `http://127.0.0.1:${address.port}`;
            resolve();
        });
    });
}

async function stopServer(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

describe('Questions API integration', () => {
    beforeEach(async () => {
        await clearDatabase();
        await startServer();
    });

    afterEach(async () => {
        await stopServer();
        await clearDatabase();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('lets the frontend load questions from the database', async () => {
        const user = await prisma.users.create({
            data: {
                name: 'Integration User',
                email: `questions-${crypto.randomUUID()}@example.com`,
                password: 'hashed-password',
            },
        });
        const question = await prisma.questions.create({
            data: {
                userId: user.id,
                title: 'Can the feed load real questions?',
                description: 'The API should return database questions to the frontend.',
                upvotes: 2,
            },
        });
        await prisma.comments.create({
            data: {
                userId: user.id,
                questionId: question.id,
                text: 'Yes, through the public API.',
            },
        });

        const response = await fetch(`${baseUrl}/api/questions`, {
            headers: {
                Origin: 'http://localhost:5173',
            },
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(response.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
        expect(body).toMatchObject({
            data: [
                {
                    id: question.id,
                    title: 'Can the feed load real questions?',
                    description: 'The API should return database questions to the frontend.',
                    upvotes: 2,
                    commentCount: 1,
                    user: {
                        id: user.id,
                        name: 'Integration User',
                    },
                },
            ],
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
        });
    });

    it('allows the 127.0.0.1 Vite origin to load the API', async () => {
        const response = await fetch(`${baseUrl}/api/questions`, {
            headers: {
                Origin: 'http://127.0.0.1:5173',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('access-control-allow-origin')).toBe('http://127.0.0.1:5173');
    });
});
