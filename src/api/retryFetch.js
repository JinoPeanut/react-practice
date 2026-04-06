export async function retryFetch(fetchFn, retryCount) {
    let lastErr = null;

    for (let i = 0; i < retryCount; i++) {
        try {
            // 성공시 runFetch 를 실행하도록 반환함.
            return await fetchFn();
        } catch (error) {
            lastErr = error;
        }
    }
    throw lastErr;
}