import { useState } from "react";
function TodoItem({ todo, checkTodo, onDelete, updateTodo }) {

    const [isEdit, setEdit] = useState(false);
    const [editText, setEditText] = useState(todo.text);

    const submitEdit = () => {
        updateTodo(todo.id, editText);
        setEdit(false);
    }

    return (
        <li style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            <button disabled={todo.done} onClick={() => checkTodo(todo.id)}>
                [{todo.done ? "✔️" : "❌"}]
            </button>
            {isEdit
                ? (<input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                />)
                : (<span>{todo.text}</span>)
            }
            {isEdit
                ? (<button onClick={submitEdit}>[저장]</button>)
                : (<button onClick={() => { setEditText(todo.text), setEdit(true) }}>[수정]</button>)
            }
            <button onClick={() => onDelete(todo.id)}>[삭제]</button>
        </li>
    )
}

export default TodoItem