import type { Ref } from 'vue';
import type { useNotice } from '../../../shared/composables/useNotice.ts';

type Notice = ReturnType<typeof useNotice>;

export async function runQuestionTask<TValue>(
    isBusy: Ref<boolean>,
    notice: Notice,
    task: () => Promise<TValue>,
): Promise<TValue | undefined> {
    isBusy.value = true;
    notice.clearNotice();

    try {
        return await task();
    } catch (error) {
        notice.showError(error);
        return undefined;
    } finally {
        isBusy.value = false;
    }
}
