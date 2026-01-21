import StudentList from "./StudentList"
import { useState } from "react";
function StudentItem({ student, setStudents }) {

    const handleBtn = () => {
        setStudents(prev => prev.map(
            s => {
                if (s.id !== student.id) return s;

                const nextChecked = !s.checked;

                return {
                    ...s,
                    checked: nextChecked,
                    checkedAt: nextChecked ? Date.now() : null,
                }
            }
        ))
    }

    return (
        <div>
            {student.checked && "✅"}
            {student.name}
            <button onClick={handleBtn}>[체크]</button>
        </div>
    )
}

export default StudentItem