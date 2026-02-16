export function normalizeAttendanceResult(result) {
    if (result.ok === true) {
        return {
            status: "Success",
            data: result.data ?? null,
            message: "출석체크 완료",
        };
    }

    if (result.error === "TOKEN_EXPIRED") {
        return {
            status: "Retryable",
            data: null,
            message: "출석 재시도 필요",
        };
    }

    return {
        status: "Failed",
        data: null,
        message: "출석체크 실패",
    };
}
