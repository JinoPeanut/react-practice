import "../App.css";

function StudentItem({ student, onToggle, time, onDelete }) {

    return (
        <div className={`student-item ${student.checked ? "checked" : ""}`}>
            {student.checked && "✅"}
            {student.name} {time && `(출석 : ${time})`}
            <button onClick={onToggle} disabled={student.isLoading}>
                {student.isLoading ? "처리중..." : "[체크]"}
            </button>
            <button onClick={onDelete}>[삭제]</button>
        </div>
    )
}

export default StudentItem