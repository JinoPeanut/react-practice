export function isSuccess(results) {
    return results.status === "Success";
}

export function isFailed(results) {
    return results.status === "Failed";
}

export function isRetryable(results) {
    return results.status === "Retryable";
}