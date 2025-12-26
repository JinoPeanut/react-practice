function TodoItem({ todo, checkTodo, onDelete }) {
    return (
        <li style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            <button disabled={todo.done} onClick={() => checkTodo(todo.id)}>
                [{todo.done ? "✔️" : "❌"}]
            </button>
            {todo.text}
            <button onClick={() => onDelete(todo.id)}>[삭제]</button>
        </li>
    )
}

export default TodoItem