import prisma from './main.ts';
import { comments, questions, seedPassword, users } from './seed-data/seedData.ts';
import { QuestionImageService } from '../services/QuestionImageService.ts';

const imageService = new QuestionImageService();

async function seedDatabase(): Promise<void> {
    await clearDatabase();

    const password = await Bun.password.hash(seedPassword);
    const userByEmail = new Map<string, { id: string }>();
    const questionByKey = new Map<string, { id: string }>();

    for (const user of users) {
        const createdUser = await prisma.users.create({
            data: {
                ...user,
                password,
            },
            select: {
                id: true,
            },
        });

        userByEmail.set(user.email, createdUser);
    }

    for (const question of questions) {
        const author = getSeedUser(userByEmail, question.authorEmail);
        const createdQuestion = await prisma.questions.create({
            data: {
                userId: author.id,
                title: question.title,
                description: question.description,
                imageData: await readSeedImage(question.key),
            },
            select: {
                id: true,
            },
        });

        questionByKey.set(question.key, createdQuestion);
    }

    for (const comment of comments) {
        await prisma.comments.create({
            data: {
                userId: getSeedUser(userByEmail, comment.authorEmail).id,
                questionId: getSeedQuestion(questionByKey, comment.questionKey).id,
                text: comment.text,
            },
        });
    }

    for (const question of questions) {
        const createdQuestion = getSeedQuestion(questionByKey, question.key);

        for (const email of question.upvoteEmails) {
            await prisma.questionVotes.create({
                data: {
                    userId: getSeedUser(userByEmail, email).id,
                    questionId: createdQuestion.id,
                    isUpvote: true,
                },
            });
        }

        await prisma.questions.update({
            where: {
                id: createdQuestion.id,
            },
            data: {
                votes: question.upvoteEmails.length,
            },
        });
    }
}

async function readSeedImage(questionKey: string): Promise<Uint8Array<ArrayBuffer> | undefined> {
    const imageFile = Bun.file(`server/prisma/seed-images/${questionKey}.jpg`);

    if (!(await imageFile.exists())) {
        return undefined;
    }

    const base64 = Buffer.from(await imageFile.arrayBuffer()).toString('base64');

    return imageService.toDatabaseBytes(base64);
}

async function clearDatabase(): Promise<void> {
    await prisma.pendingPasswordReset.deleteMany({});
    await prisma.commentVotes.deleteMany({});
    await prisma.questionVotes.deleteMany({});
    await prisma.comments.deleteMany({});
    await prisma.questions.deleteMany({});
    await prisma.users.deleteMany({});
}

function getSeedUser(
    userByEmail: Map<string, { id: string }>,
    email: string,
): { id: string } {
    const user = userByEmail.get(email);

    if (!user) {
        throw new Error(`Seed user was not found: ${email}`);
    }

    return user;
}

function getSeedQuestion(
    questionByKey: Map<string, { id: string }>,
    key: string,
): { id: string } {
    const question = questionByKey.get(key);

    if (!question) {
        throw new Error(`Seed question was not found: ${key}`);
    }

    return question;
}

try {
    await seedDatabase();
    console.log(`Seeded ${users.length} users, ${questions.length} questions, and ${comments.length} answers.`);
    console.log(`Demo login: kaspar@example.com / ${seedPassword}`);
} catch (error) {
    console.error(error);
    process.exit(1);
} finally {
    await prisma.$disconnect();
}
