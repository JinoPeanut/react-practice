function TodoItem({ todo, checkTodo }) {
    return (
        <li style={{ textDecoration: todo.done ? "line-through" : "none" }}>
            <button disabled={todo.done} onClick={() => checkTodo(todo.id)}>
                [{todo.done ? "✔️" : "❌"}]
            </button>
            {todo.text}
        </li>
    )
}

export default TodoItem