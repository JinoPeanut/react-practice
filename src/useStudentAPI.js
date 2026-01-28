export function useStudentAPI() {

    async function runStudentPatch(targets, bodyBuilder) {
        return Promise.all(
            targets.map(async (student) => {
                try {
                    const body = bodyBuilder(student);
                    await runFetch(student.id, body);

                    return { id: student.id, success: true }
                } catch {
                    return { id: student.id, success: false }
                }
            })
        );
    }

    async function runFetch(id, body) {
        const res = await fetch(`http://localhost:3001/students/${id}`, {
            method: "PATCH",
            headers: { "Content-type": "application/json" },
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error();
    }

    const checkMany = async (targets) => {
        return runStudentPatch(targets, () => ({
            checked: true,
            checkedAt: Date.now(),
        }))
    }

    const toggleCheck = async (id, nextChecked, checkedAt) => {
        try {
            await runFetch(id, {
                checked: nextChecked,
                checkedAt,
            });

            return { success: true };
        } catch {
            return { success: false };
        }
    }

    const resetCheck = async (targets) => {
        return runStudentPatch(targets, () => ({
            checked: false,
            checkedAt: null,
        }))
    }

    return { checkMany, toggleCheck, resetCheck };
}