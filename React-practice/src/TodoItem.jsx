import { useState } from "react";
function TodoItem({
    todo, checkTodo, onDelete, editingId, editingText, setEditingText, startEdit, submitEdit,
}) {

    const isEdit = editingId === todo.id;

    return (
        <li style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            <button disabled={todo.done} onClick={() => checkTodo(todo.id)}>
                [{todo.done ? "✔️" : "❌"}]
            </button>
            {isEdit
                ? (<input
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            submitEdit();
                        }
                    }}

                />)
                : (<span onDoubleClick={() => startEdit(todo)}>
                    {todo.text}
                </span>)
            }
            {isEdit
                ? (<button onClick={() => submitEdit()}>[저장]</button>)
                : (<button onClick={() => startEdit(todo)}>[수정]</button>)
            }
            <button onClick={() => onDelete(todo.id)}>[삭제]</button>
        </li>
    )
}

export default TodoItem