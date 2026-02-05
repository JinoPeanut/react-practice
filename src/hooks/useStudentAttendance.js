import { useEffect, useState } from "react";

export function useStudentAttendance() {

    const [status, setStatus] = useState("idle");
    const [errorMessage, setErrorMessage] = useState(null);

    const STATUS = {
        IDLE: "idle",
        LOADING: "loading",
        SUCCESS: "success",
        ERROR: "error",
    };

    const toggleCheck = async () => {
        setStatus(STATUS.LOADING);
        setErrorMessage(null);

        try {
            await fakeToggleAttendance();
            setStatus(STATUS.SUCCESS);
        } catch (e) {
            setStatus(STATUS.ERROR);
            setErrorMessage(e.message);
        }
    };

    useEffect(() => {
        if (status !== STATUS.SUCCESS) return;

        const timeout = setTimeout(() => {
            setStatus(STATUS.IDLE);
        }, 2000)

        return () => clearTimeout(timeout);

    }, [status])

    useEffect(() => {
        if (status !== STATUS.ERROR) return;

        const timeout = setTimeout(() => {
            setStatus(STATUS.IDLE);
            setErrorMessage(null);
        }, 3000)

        return () => clearTimeout(timeout);
    }, [status])

    return {
        status,
        errorMessage,
        toggleCheck,
    }
}