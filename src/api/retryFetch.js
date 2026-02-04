export async function retryFetch(fetchFn, retryCount) {
    let lastErr = null;

    for (let i = 0; i < retryCount; i++) {
        try {
            return await fetchFn();
        } catch (error) {
            lastErr = error;
        }
    }
    throw lastErr;
}