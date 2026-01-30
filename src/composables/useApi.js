// src/composables/useApi.js
import { ref } from 'vue';

/**
 * Composable untuk handle API calls dengan ApiResponseTrait format
 * Sudah tidak perlu lagi karena interceptor sudah handle unwrapping
 * Tapi tetap berguna untuk consistent error handling
 */
export function useApi() {
    const loading = ref(false);
    const error = ref(null);

    /**
     * Call API dengan automatic success checking
     * @param {Function} apiFunction - Function yang return promise dari apiClient
     * @param {Function} onSuccess - Callback saat success (params: data, message)
     * @param {Function} onError - Callback saat error (params: errorMessage)
     * @returns {Promise} - Returns data if success, null if error
     */
    const callApi = async (apiFunction, onSuccess, onError) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiFunction();

            // After interceptor, response is { success, message, data }
            if (response.success) {
                if (onSuccess) onSuccess(response.data, response.message);
                return response.data;
            } else {
                error.value = response.message;
                if (onError) onError(response.message);
                return null;
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Terjadi kesalahan';
            error.value = errorMsg;
            if (onError) onError(errorMsg);
            return null;
        } finally {
            loading.value = false;
        }
    };

    return {
        loading,
        error,
        callApi
    };
}
