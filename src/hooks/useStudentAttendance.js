import { useEffect, useReducer, useState, useRef } from "react";

export function useStudentAttendance() {

    const initialState = {
        status: "idle",
        requestId: 0,
        errorMessage: null,
        lastUpdatedAt: null,
    }

    const [state, dispatch] = useReducer(reducer, initialState);

    const abortRef = useRef(null);

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
        dispatch({ type: "TOGGLE_REQUESTED" });
    };

    useEffect(() => {
        if (!statusLoading()) return;

        const controller = new AbortController();

        fakeToggleAttendance({ signal: controller.signal })
            .then(() => dispatch({ type: "SUCCESS" }))
            .catch(() => dispatch({ type: "ERROR", message: "출석 실패" }))

        return () => controller.abort();
    }, [state.status])

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

    }, [state.status])

    return {
        status: state.status,
        errorMessage: state.errorMessage,
        lastUpdatedAt: state.lastUpdatedAt,
        toggleCheck,
    }
}

function reducer(state, action) {
    const handler = reducers[action.type];
    return handler ? handler(state, action) : state;
}

const reducers = {
    TOGGLE_REQUESTED: (state) => {
        if (state.status === "loading") return state;
        if (state.lastUpdatedAt && Date.now() - state.lastUpdatedAt < 5000) return state;
        return {
            ...state,
            status: "loading",
            requestId: state.requestId + 1,
            errorMessage: null,
        }
    },

    SUCCESS: (state) => {
        if (state.status !== "loading") return state;
        return {
            status: "success",
            errorMessage: null,
            lastUpdatedAt: Date.now(),
        }
    },

    ERROR: (state, action) => {
        if (state.status !== "loading") return state;
        return {
            status: "error",
            errorMessage: action.message,
            lastUpdatedAt: Date.now(),
        }
    },

    RESET: (state) => ({
        status: "idle",
        errorMessage: null,
        lastUpdatedAt: state.lastUpdatedAt
        // 리셋해도 시간을 초기화할 필요없으니 있는값 그대로 전달
    })
}