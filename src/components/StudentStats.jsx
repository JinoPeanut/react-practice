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
        <div className="
            space-y-1
            bg-gray-50
            p-4 rounded-xl
            shadow-sm text-sm
        ">
            <div className={`font-semibold ${stats.percent >= 50 ? "text-green-600" : "text-red-600"}`}>
                <p>전체인원: {stats.total}명</p>
                <p>출석완료: {stats.completed}명</p>
                <p>미출석: {stats.unCompleted}명</p>
                <p>출석률: {stats.percent}%</p>
            </div>
        </div>
    )
}

export default StudentStats;