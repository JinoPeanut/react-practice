import { useStudentAttendance } from "../hooks/useStudentAttendance";

function AttendanceButton() {
    const { status, errorMessage, lastUpdatedAt, toggleCheck } = useStudentAttendance();

    return (
        <div>
            <button
                onClick={toggleCheck}
                disabled={status === "loading"}
            >
                {status === "loading" ? "처리중..." : "출석 토글"}
            </button>

            {status === "success" && <p style={{ color: "green" }}>출석 성공!</p>}

            {
                status === "error" && (
                    <>
                        <p style={{ color: "red" }}>{errorMessage}</p>
                        <button onClick={toggleCheck}>다시 시도</button>
                    </>
                )
            }

            <div>
                {lastUpdatedAt &&
                    (<p>마지막 처리 시간: {new Date(lastUpdatedAt).toLocaleTimeString()}</p>)
                }
            </div>
        </div >
    )
}

export default AttendanceButton