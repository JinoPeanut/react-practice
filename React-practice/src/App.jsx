import { useState } from "react";
import TodoItem from "./TodoItem";

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "공부하기", done: false },
    { id: 2, text: "운동하기", done: false },
    { id: 3, text: "밥먹기", done: false },
  ]);

  const checkTodo = (id) => {
    setTodos(prev => prev.map(
      todo => todo.id === id
        ? { ...todo, done: !todo.done }
        : todo
    ))
  }
  const onDelete = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  let visibleTodos = todos;

  const [filter, setFilters] = useState("all");
  if (filter === "done") {
    visibleTodos = todos.filter(todo => todo.done);
  }
  if (filter === "undone") {
    visibleTodos = todos.filter(todo => !todo.done);
  }

  const AllTodos = todos.length;
  const successTodos = todos.filter(todo => todo.done).length;

  const hasDone = todos.some(todo => todo.done);
  const toggleAll = () => {
    setTodos(prev => prev.map(
      todo => ({
        ...todo,
        done: !hasDone,
      })
    ))
  }

  return (
    <div>
      <button onClick={() => setFilters("all")}>[전체]</button>
      <button onClick={() => setFilters("done")}>[완료]</button>
      <button onClick={() => setFilters("undone")}>[미완료]</button>
      <ul>
        {visibleTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            checkTodo={checkTodo}
            onDelete={onDelete}
          ></TodoItem>
        ))}
      </ul>
      <button onClick={toggleAll}>{hasDone ? "전체해제" : "전체완료"}</button>
      <h1>완료: {successTodos}, 전체: {AllTodos}</h1>
    </div>
  )
}

export default App
