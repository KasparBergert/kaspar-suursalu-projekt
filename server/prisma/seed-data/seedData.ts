export type SeedUser = {
    email: string;
    name: string;
};

export type SeedQuestion = {
    authorEmail: string;
    description: string;
    key: string;
    title: string;
    upvoteEmails: string[];
};

export type SeedComment = {
    authorEmail: string;
    questionKey: string;
    text: string;
};

export const seedPassword = 'password123';

export const users: SeedUser[] = [
    {
        name: 'Kaspar Suursalu',
        email: 'kaspar@example.com',
    },
    {
        name: 'Marta Kask',
        email: 'marta@example.com',
    },
    {
        name: 'Rasmus Tamm',
        email: 'rasmus@example.com',
    },
    {
        name: 'Liis Saar',
        email: 'liis@example.com',
    },
    {
        name: 'Oliver Mets',
        email: 'oliver@example.com',
    },
];

export const questions: SeedQuestion[] = [
    {
        key: 'frontend-structure',
        authorEmail: 'kaspar@example.com',
        title: 'How should I structure a Vue frontend when it starts growing?',
        description: 'I have pages, features, reusable components, services, and composables. What belongs where so the code still reads like a flow?',
        upvoteEmails: ['marta@example.com', 'rasmus@example.com', 'liis@example.com'],
    },
    {
        key: 'api-errors',
        authorEmail: 'marta@example.com',
        title: 'Should controllers catch errors or should Express middleware handle them?',
        description: 'I want my controllers to stay simple, but I also need good status codes and consistent JSON error responses.',
        upvoteEmails: ['kaspar@example.com', 'rasmus@example.com'],
    },
    {
        key: 'pagination-limit',
        authorEmail: 'rasmus@example.com',
        title: 'Why should pagination limits be owned by the server?',
        description: 'A client can request a huge limit if the API allows it. Is it better to expose only the page parameter?',
        upvoteEmails: ['kaspar@example.com', 'marta@example.com', 'liis@example.com', 'oliver@example.com'],
    },
    {
        key: 'jwt-logout',
        authorEmail: 'liis@example.com',
        title: 'How do you log out a user when the API uses JWT tokens?',
        description: 'JWTs are stateless, so I am confused about what logout should actually do on the backend.',
        upvoteEmails: ['kaspar@example.com', 'oliver@example.com'],
    },
    {
        key: 'database-seeding',
        authorEmail: 'oliver@example.com',
        title: 'What makes a useful seed file for a local development database?',
        description: 'I want data that makes the whole app visible immediately: users, questions, answers, and votes.',
        upvoteEmails: ['kaspar@example.com', 'marta@example.com', 'rasmus@example.com'],
    },
    {
        key: 'unit-vs-e2e',
        authorEmail: 'kaspar@example.com',
        title: 'When is a backend test really an end-to-end test?',
        description: 'If a test goes through routes, middleware, controllers, services, and the database, what should I call it?',
        upvoteEmails: ['marta@example.com', 'liis@example.com'],
    },
];

export const comments: SeedComment[] = [
    {
        questionKey: 'frontend-structure',
        authorEmail: 'marta@example.com',
        text: 'I like grouping by feature first. It keeps auth code near auth UI, and question code near question UI.',
    },
    {
        questionKey: 'frontend-structure',
        authorEmail: 'rasmus@example.com',
        text: 'A shared folder is useful, but only for things that are genuinely reused by multiple features.',
    },
    {
        questionKey: 'api-errors',
        authorEmail: 'kaspar@example.com',
        text: 'The controller can set the status and pass the original error to next. The middleware owns the response shape.',
    },
    {
        questionKey: 'api-errors',
        authorEmail: 'liis@example.com',
        text: 'That also makes unit tests clearer because controller tests check next(error), not JSON formatting.',
    },
    {
        questionKey: 'pagination-limit',
        authorEmail: 'oliver@example.com',
        text: 'Yes. Page is user choice, limit is server policy. That keeps the endpoint harder to abuse.',
    },
    {
        questionKey: 'jwt-logout',
        authorEmail: 'marta@example.com',
        text: 'For a real production setup, store invalidated tokens or use a token version in the database.',
    },
    {
        questionKey: 'database-seeding',
        authorEmail: 'kaspar@example.com',
        text: 'Seed data should cover the screens you want to inspect. One empty question is not enough.',
    },
    {
        questionKey: 'unit-vs-e2e',
        authorEmail: 'rasmus@example.com',
        text: 'If it touches the real HTTP boundary and database, I would call it an API end-to-end test.',
    },
];
