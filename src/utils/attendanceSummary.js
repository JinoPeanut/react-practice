export function createAttendanceSummary(results) {
    const failed = results.filter(r => r.status === "Failed");
    const success = results.filter(r => r.status === "Success");

    return {
        total: results.length,
        success: success.length,
        failed: failed.length,
    }
}