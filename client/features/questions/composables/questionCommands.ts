import * as questionsApi from '../services/questionsApi.ts';
import type { CreateQuestionPayload, QuestionData, VoteState } from '../../../types.ts';
import type { useQuestionCollections } from './useQuestionCollections.ts';
import type { useSelectedQuestion } from './useSelectedQuestion.ts';

type QuestionCollections = ReturnType<typeof useQuestionCollections>;
type SelectedQuestion = ReturnType<typeof useSelectedQuestion>;

export async function createQuestion(
    payload: CreateQuestionPayload,
    collections: QuestionCollections,
    selectedQuestion: SelectedQuestion,
): Promise<QuestionData> {
    const question = await questionsApi.createQuestion(payload);

    collections.prependQuestion(question);

    return question;
}

export async function setQuestionVote(
    questionId: string,
    vote: VoteState,
    collections: QuestionCollections,
    selectedQuestion: SelectedQuestion,
): Promise<QuestionData> {
    const updatedQuestion = await questionsApi.setQuestionVote(questionId, vote);

    collections.replaceQuestion(updatedQuestion);
    selectedQuestion.updateSelectedQuestion(updatedQuestion);

    return updatedQuestion;
}

export async function addAnswer(
    questionId: string,
    text: string,
    selectedQuestion: SelectedQuestion,
): Promise<void> {
    await questionsApi.addAnswer(questionId, text);
    await selectedQuestion.selectQuestion(questionId);
}
