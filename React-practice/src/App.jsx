import { useState } from "react";
import FoodItem from "./FoodItem";
import TodoItem from "./TodoItem";

function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: "공부하기", done: false },
    { id: 2, text: "운동하기", done: false },
    { id: 3, text: "밥먹기", done: false },
  ]);

  const undoneTodos = todos.filter(todo => !todo.done);
  const doneTodos = todos.filter(todo => todo.done);

  const checkTodo = (id) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done }
          : todo
      )
    );
  }

  const todoTotal = todos.length;
  const todoSuccess = todos.filter(todo => todo.done).length;

  return (
    <div>
      <ul>
        {[...undoneTodos, ...doneTodos].map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            checkTodo={checkTodo}
          />
        ))}
      </ul>

      <h1>완료: {todoSuccess}, 전체: {todoTotal}</h1>
    </div>
  )
}

export default App
