export function useStudentAPI() {
    const checkMany = async (targets, now) => {
        return Promise.all(
            targets.map(async (student) => {
                try {
                    const res = await fetch(`http://localhost:3001/students/${student.id}`, {
                        method: "PATCH",
                        headers: { "Content-type": "application/json" },
                        body: JSON.stringify({
                            checked: true,
                            checkedAt: now,
                        })
                    });

                    if (!res.ok) throw new Error();

                    return { id: student.id, success: true }
                } catch {
                    return { id: student.id, success: false }
                }
            })
        );
    }

    const toggleCheck = async (id, nextChecked, checkedAt) => {
        try {
            fetch(`http://localhost:3001/students/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    checked: nextChecked,
                    checkedAt,
                })
            })

            if (!res.ok) throw new Error();
            return { success: true };
        } catch {
            return { success: false };
        }
    }

    return { checkMany, toggleCheck };
}