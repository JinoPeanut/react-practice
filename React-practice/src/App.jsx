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

  const [text, setText] = useState("");

  const addTodo = () => {
    if (text.trim() === "") return;

    const newTodo = {
      id: Date.now(),
      text: text,
      done: false,
    }

    setTodos(prev => [...prev, newTodo]);
    setText("");
  }

  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const startEdit = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text)
  }

  const submitEdit = () => {
    setTodos(prev => prev.map(
      todo => todo.id === editingId
        ? { ...todo, text: editingText }
        : todo
    ))
    setEditingId(null);
    setEditingText("");
  }

  return (
    <div>
      <div>
        <button onClick={() => setFilters("all")}>[전체]</button>
        <button onClick={() => setFilters("done")}>[완료]</button>
        <button onClick={() => setFilters("undone")}>[미완료]</button>
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addTodo();
          }
        }}
      />
      <button onClick={addTodo}>[입력]</button>

      <ul>
        {visibleTodos.map(todo => (
          <TodoItem
            key={todo.id}
            todo={todo}
            checkTodo={checkTodo}
            onDelete={onDelete}
            editingId={editingId}
            startEdit={startEdit}
            editingText={editingText}
            setEditingText={setEditingText}
            submitEdit={submitEdit}
          ></TodoItem>
        ))}
      </ul>
      <button onClick={toggleAll}>{hasDone ? "전체해제" : "전체완료"}</button>
      <h1>완료: {successTodos}, 전체: {AllTodos}</h1>
    </div>
  )
}

export default App
