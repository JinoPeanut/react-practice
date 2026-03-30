import { isSuccess } from "./attendanceStatus";

export function shouldCache(result) {
    return isSuccess(result)
}