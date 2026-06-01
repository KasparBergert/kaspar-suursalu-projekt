import * as questionsApi from '../services/questionsApi.ts';
import type { CreateQuestionPayload, QuestionData } from '../../../types.ts';
import type { useQuestionCollections } from './useQuestionCollections.ts';
import type { useSelectedQuestion } from './useSelectedQuestion.ts';

type QuestionCollections = ReturnType<typeof useQuestionCollections>;
type SelectedQuestion = ReturnType<typeof useSelectedQuestion>;

export async function postQuestion(
    payload: CreateQuestionPayload,
    token: string,
    collections: QuestionCollections,
    selectedQuestion: SelectedQuestion,
): Promise<QuestionData> {
    const question = await questionsApi.createQuestion(payload, token);

    collections.prependQuestion(question);
    await selectedQuestion.selectQuestion(question.id);

    return question;
}

export async function upvoteQuestion(
    questionId: string,
    token: string,
    collections: QuestionCollections,
    selectedQuestion: SelectedQuestion,
): Promise<void> {
    const updatedQuestion = await questionsApi.upvoteQuestion(questionId, token);

    collections.replaceQuestion(updatedQuestion);
    selectedQuestion.updateSelectedQuestion(updatedQuestion);
}

export async function postAnswer(
    questionId: string,
    text: string,
    token: string,
    selectedQuestion: SelectedQuestion,
): Promise<void> {
    await questionsApi.addAnswer(questionId, text, token);
    await selectedQuestion.selectQuestion(questionId);
}
