import { useEffect, useReducer, useState } from "react";

export function useStudentAttendance() {

    const initialState = {
        status: "idle",
        errorMessage: null,
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    const STATUS = {
        IDLE: "idle",
        LOADING: "loading",
        SUCCESS: "success",
        ERROR: "error",
    };

    const statusIdle = () => state.status === STATUS.IDLE;
    const statusSuccess = () => state.status === STATUS.SUCCESS;
    const statusLoading = () => state.status === STATUS.LOADING;
    const statusError = () => state.status === STATUS.ERROR;

    const toggleCheck = async () => {
        if (statusLoading()) return;

        dispatch({ type: "LOADING" });

        try {
            await fakeToggleAttendance();
            dispatch({ type: "SUCCESS" });
        } catch (e) {
            dispatch({
                type: "ERROR",
                message: "출석 실패",
            })
        }
    };

    useEffect(() => {
        let timeout;

        if (statusSuccess()) {
            timeout = setTimeout(() => {
                dispatch({ type: "RESET" });
            }, 2000)
        }

        if (statusError()) {
            timeout = setTimeout(() => {
                dispatch({ type: "RESET" });
            }, 3000)
        }

        return () => {
            if (timeout) clearTimeout(timeout);
        }

    }, [state])

    return {
        status: state.status,
        errorMessage: state.errorMessage,
        toggleCheck,
    }
}

function reducer(state, action) {
    switch (action.type) {
        case "LOADING":
            return { status: "loading", errorMessage: null };

        case "SUCCESS":
            return { status: "success", errorMessage: null };

        case "ERROR":
            return { status: "error", errorMessage: action.message };

        case "RESET":
            return { status: "idle", errorMessage: null };

        default:
            return state;
    }
}