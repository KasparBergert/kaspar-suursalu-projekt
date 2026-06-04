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

type QuestionTemplate = {
    author: string;
    comments: Array<{
        author: string;
        text: string;
    }>;
    description: string;
    key: string;
    title: string;
    upvoters: string[];
};

export const seedPassword = 'password123';

const names = [
    'Kaspar Suursalu',
    'Marta Kask',
    'Rasmus Tamm',
    'Liis Saar',
    'Oliver Mets',
];

const generatedQuestionTitles = [
    'Why does my local API work in tests but fail in the browser?',
    'How do I decide what belongs in a composable?',
    'What is the easiest way to debug Prisma relations?',
    'Should a school project use one store or multiple stores?',
    'How do I keep a Vue page from becoming too large?',
    'When should frontend state be reset after submitting a form?',
    'How should I name API response types?',
    'What makes a database seed file useful for demos?',
    'How do I show loading states without making the UI noisy?',
    'Should profile pages reuse the same question card as the feed?',
    'What is a simple way to test authenticated endpoints?',
    'How do I make modal forms feel less confusing?',
    'Should search be instant or wait for the user to press enter?',
    'How much validation should a first version include?',
    'What should happen after a question is created?',
    'How do I avoid repeating mapper code in services?',
    'When is it okay to store images in the database?',
    'How can I make a local app easier for a teacher to launch?',
    'Should buttons say exactly what action they perform?',
    'What is the cleanest way to show API errors in Vue?',
];

const seedAuthors = ['kaspar', 'marta', 'rasmus', 'liis', 'oliver'];

const questionTemplates: QuestionTemplate[] = [
    {
        key: 'frontend-structure',
        author: 'kaspar',
        title: 'How should I structure a Vue frontend when it starts growing?',
        description: 'I have pages, features, reusable components, services, and composables. What belongs where so the code still reads like a flow?',
        upvoters: ['marta', 'rasmus', 'liis'],
        comments: [
            {
                author: 'marta',
                text: 'I like grouping by feature first. It keeps auth code near auth UI, and question code near question UI.',
            },
            {
                author: 'rasmus',
                text: 'A shared folder is useful, but only for things that are genuinely reused by multiple features.',
            },
        ],
    },
    {
        key: 'api-errors',
        author: 'marta',
        title: 'Should controllers catch errors or should Express middleware handle them?',
        description: 'I want my controllers to stay simple, but I also need good status codes and consistent JSON error responses.',
        upvoters: ['kaspar', 'rasmus'],
        comments: [
            {
                author: 'kaspar',
                text: 'The controller can set the status and pass the original error to next. The middleware owns the response shape.',
            },
            {
                author: 'liis',
                text: 'That also makes unit tests clearer because controller tests check next(error), not JSON formatting.',
            },
        ],
    },
    {
        key: 'pagination-limit',
        author: 'rasmus',
        title: 'Why should pagination limits be owned by the server?',
        description: 'A client can request a huge limit if the API allows it. Is it better to expose only the page parameter?',
        upvoters: ['kaspar', 'marta', 'liis', 'oliver'],
        comments: [
            {
                author: 'oliver',
                text: 'Yes. Page is user choice, limit is server policy. That keeps the endpoint harder to abuse.',
            },
        ],
    },
    {
        key: 'jwt-logout',
        author: 'liis',
        title: 'How do you log out a user when the API uses JWT tokens?',
        description: 'JWTs are stateless, so I am confused about what logout should actually do on the backend.',
        upvoters: ['kaspar', 'oliver'],
        comments: [
            {
                author: 'marta',
                text: 'For a real production setup, store invalidated tokens or use a token version in the database.',
            },
        ],
    },
    {
        key: 'database-seeding',
        author: 'oliver',
        title: 'What makes a useful seed file for a local development database?',
        description: 'I want data that makes the whole app visible immediately: users, questions, answers, and votes.',
        upvoters: ['kaspar', 'marta', 'rasmus'],
        comments: [
            {
                author: 'kaspar',
                text: 'Seed data should cover the screens you want to inspect. One empty question is not enough.',
            },
        ],
    },
    {
        key: 'unit-vs-e2e',
        author: 'kaspar',
        title: 'When is a backend test really an end-to-end test?',
        description: 'If a test goes through routes, middleware, controllers, services, and the database, what should I call it?',
        upvoters: ['marta', 'liis'],
        comments: [
            {
                author: 'rasmus',
                text: 'If it touches the real HTTP boundary and database, I would call it an API end-to-end test.',
            },
        ],
    },
    {
        key: 'modal-state',
        author: 'marta',
        title: 'What is the cleanest way to manage modal state in Vue?',
        description: 'I have login, register, and ask-question modals. Should each component own its own modal, or should the app have one shared modal controller?',
        upvoters: ['kaspar', 'liis', 'oliver'],
        comments: [
            {
                author: 'kaspar',
                text: 'A shared modal controller works well when only one modal can be open at a time. It keeps the page components lighter.',
            },
            {
                author: 'rasmus',
                text: 'I would still keep the form logic inside the modal content component so it does not all collect in App.vue.',
            },
        ],
    },
    {
        key: 'auth-state-refresh',
        author: 'rasmus',
        title: 'Where should frontend authentication state be restored from?',
        description: 'When the page refreshes, should I trust localStorage user data, or should I load the profile from the API again?',
        upvoters: ['kaspar', 'marta'],
        comments: [
            {
                author: 'liis',
                text: 'Store the token locally, then ask the API for the profile. Local user data is fine for display, but the API should confirm the session.',
            },
        ],
    },
    {
        key: 'service-layer',
        author: 'liis',
        title: 'Is a service layer useful in a small Express app?',
        description: 'My controllers can call Prisma directly, but I also see examples where controllers call services. Is that overkill for a school project?',
        upvoters: ['kaspar', 'rasmus', 'oliver'],
        comments: [
            {
                author: 'marta',
                text: 'It is useful if your controller would otherwise contain business rules. For simple CRUD, direct Prisma is easier.',
            },
            {
                author: 'oliver',
                text: 'For this app, votes and duplicate checks make a service layer feel justified.',
            },
        ],
    },
    {
        key: 'optimistic-ui',
        author: 'oliver',
        title: 'Should upvotes update optimistically in the UI?',
        description: 'It feels faster if the vote count changes immediately, but I worry about duplicate vote errors coming back from the server.',
        upvoters: ['marta', 'liis'],
        comments: [
            {
                author: 'kaspar',
                text: 'Optimistic UI is nice, but only if you handle rollback. For a first version, waiting for the server response is totally acceptable.',
            },
        ],
    },
    {
        key: 'component-names',
        author: 'kaspar',
        title: 'How specific should Vue component names be?',
        description: 'I have names like BrowsePanel, QuestionList, and QuestionDetail. Should names describe the UI shape or the feature responsibility?',
        upvoters: ['marta', 'rasmus', 'liis', 'oliver'],
        comments: [
            {
                author: 'rasmus',
                text: 'Feature responsibility usually ages better. A component can stop looking like a panel, but it probably still belongs to browsing.',
            },
        ],
    },
    {
        key: 'empty-states',
        author: 'marta',
        title: 'What makes a good empty state for a question feed?',
        description: 'When there are no questions yet, should I just show a sentence, or should I include a button to ask the first question?',
        upvoters: ['kaspar', 'oliver'],
        comments: [
            {
                author: 'liis',
                text: 'A sentence is enough for tests, but a button is better UX because it gives the user a next action.',
            },
        ],
    },
    {
        key: 'prisma-transactions',
        author: 'rasmus',
        title: 'When should Prisma writes use a transaction?',
        description: 'For upvoting, I create an upvote row and increment the question count. Should that always be one transaction?',
        upvoters: ['kaspar', 'marta', 'liis'],
        comments: [
            {
                author: 'oliver',
                text: 'Yes. If one write succeeds and the other fails, the displayed count and the vote records disagree.',
            },
            {
                author: 'kaspar',
                text: 'Transactions are especially useful when you denormalize counts like this.',
            },
        ],
    },
    {
        key: 'test-fixtures',
        author: 'liis',
        title: 'How much mock data should unit tests create?',
        description: 'My tests need users, questions, and comments. I do not want every test to repeat the same giant object setup.',
        upvoters: ['marta', 'rasmus'],
        comments: [
            {
                author: 'kaspar',
                text: 'Small factory helpers are perfect for that. Defaults keep tests short, and overrides show what each test cares about.',
            },
        ],
    },
    {
        key: 'route-names',
        author: 'oliver',
        title: 'Should API routes use nouns or verbs?',
        description: 'For votes, is POST /questions/:id/upvotes better than POST /questions/:id/upvote?',
        upvoters: ['kaspar', 'marta', 'liis'],
        comments: [
            {
                author: 'rasmus',
                text: 'The noun version is more REST-like. You are creating an upvote resource under a question.',
            },
        ],
    },
    {
        key: 'frontend-errors',
        author: 'kaspar',
        title: 'Where should frontend error messages be displayed?',
        description: 'Some errors belong near a form field, but API errors like duplicate upvotes feel more like global notices. How do I choose?',
        upvoters: ['marta', 'rasmus', 'oliver'],
        comments: [
            {
                author: 'marta',
                text: 'If the user can fix it in one field, keep it near that field. If it affects the whole action, a global notice is clearer.',
            },
        ],
    },
    ...generatedQuestionTitles.map((title, index): QuestionTemplate => {
        const author = seedAuthors[index % seedAuthors.length] ?? 'kaspar';
        const commenter = seedAuthors[(index + 1) % seedAuthors.length] ?? 'marta';
        const firstUpvoter = seedAuthors[(index + 2) % seedAuthors.length] ?? 'rasmus';
        const secondUpvoter = seedAuthors[(index + 3) % seedAuthors.length] ?? 'liis';

        return {
            key: `generated-question-${index + 1}`,
            author,
            title,
            description: `This is generated seed question ${index + 1}. It exists so the local feed has enough realistic-looking data to scroll, search, and test.`,
            upvoters: [firstUpvoter, secondUpvoter],
            comments: [
                {
                    author: commenter,
                    text: 'This is a generated seed answer so the card has comment data during local testing.',
                },
            ],
        };
    }),
];

export const users: SeedUser[] = names.map((name) => ({
    email: createEmail(name),
    name,
}));

export const questions: SeedQuestion[] = questionTemplates.map((question) => ({
    authorEmail: emailFor(question.author),
    description: question.description,
    key: question.key,
    title: question.title,
    upvoteEmails: question.upvoters.map(emailFor),
}));

export const comments: SeedComment[] = questionTemplates.flatMap((question) =>
    question.comments.map((comment) => ({
        authorEmail: emailFor(comment.author),
        questionKey: question.key,
        text: comment.text,
    })),
);

function createEmail(name: string): string {
    const [firstName = 'user'] = name.split(' ');
    return `${firstName.toLowerCase()}@example.com`;
}

function emailFor(firstName: string): string {
    return `${firstName.toLowerCase()}@example.com`;
}
