import { ref } from 'vue';
import { getErrorMessage } from '../../utils/errors.ts';

export function useNotice() {
    const message = ref('');
    const errorMessage = ref('');

    function clearNotice(): void {
        message.value = '';
        errorMessage.value = '';
    }

    function showMessage(nextMessage: string): void {
        message.value = nextMessage;
        errorMessage.value = '';
    }

    function showError(error: unknown): void {
        message.value = '';
        errorMessage.value = getErrorMessage(error);
    }

    function showErrorMessage(nextErrorMessage: string): void {
        message.value = '';
        errorMessage.value = nextErrorMessage;
    }

    return {
        clearNotice,
        errorMessage,
        message,
        showError,
        showErrorMessage,
        showMessage,
    };
}
