import prisma from '../prisma/main.ts';
import type { QuestionData } from '../interfaces/QuestionInterfaces.ts';

export class UserService {
    async getQuestions(userId: string): Promise<QuestionData[]> {
        const questions = await prisma.questions.findMany({
            where: {
                userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
        });

        return questions.map((question) => ({
            id: question.id,
            title: question.title,
            description: question.description,
            upvotes: question.upvotes,
            commentCount: question._count.comments,
            user: question.user,
        }));
    }
}
