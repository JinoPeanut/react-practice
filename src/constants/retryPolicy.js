import { API_ERROR } from "./apiError"

export const RETRYABLE_ERROR_TYPE = [
    API_ERROR.NETWORK,
    API_ERROR.TIMEOUT,
]