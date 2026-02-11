export function fakeToggleAttendance({ signal }) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {

            const isSuccess = Math.random() > 0.3;

            if (isSuccess) {
                resolve("success");
            } else {
                reject(new Error("Network Error"));
            }
        }, 2000);

        signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
        });
    });
}
