import { useEffect, useReducer, useState, useRef } from "react";

export function useStudentAttendance() {

    const initialState = {
        status: "idle",
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
        if (statusLoading()) return;

        abortRef.current?.abort();

        const controller = new AbortController();
        abortRef.current = controller;


        dispatch({ type: "LOADING" });

        try {
            await fakeToggleAttendance({ signal: controller.signal });

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
            abortRef.current?.abort();
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
    LOADING: (state) => ({
        ...state,
        status: "loading",
        errorMessage: null,
        // 로딩상태일때 굳이 lastUpdatedAt 을 바꿀필요 없어서 안적음
    }),

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