import { useState } from "react";

function App() {
  const name = "홍길동";
  const foods = ["치킨", "피자", "햄버거"];
  const [age, setCount] = useState(19);

  return (
    <div>
      <p>이름: {name}</p>
      <p>나이: {age}</p>
      {(age >= 20) ? <p>성인입니다</p> : <p>학생입니다</p>}

      <ul>
        {foods.map((food, index) => (
          <li key={index}>{food}</li>
        ))}
      </ul>

      <button onClick={() => { setCount(age + 1); }}>
        나이 증가 버튼
      </button>

      <h1>{age}</h1>

    </div>
  )
}

export default App
