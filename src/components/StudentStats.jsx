import { useMemo } from "react";

function StudentStats({ students }) {
    const stats = useMemo(() => {
        const total = students.length;
        const completed = students.filter(s => s.checked).length;
        const unCompleted = students.filter(s => !s.checked).length;
        const percent = (total === 0) ? 0 : Math.floor((completed / total) * 100);

        return {
            total,
            completed,
            unCompleted,
            percent,
        }
    }, [students])

    return (
        <div>
            <p>전체인원: {stats.total}명</p>
            <p>출석완료: {stats.completed}명</p>
            <p>미출석: {stats.unCompleted}명</p>
            <p>출석률: {stats.percent}%</p>
        </div>
    )
}

export default StudentStats;