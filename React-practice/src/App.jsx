import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const timeoutRef = useRef(null);
  const saveRef = useRef({});

  const saveHandler = () => {
    if (!text) return;

    saveRef.current[text] = text;
    console.log("기록 성공: ", saveRef.current);
  }

  const executeHandler = () => {
    if (!text) return;

    clearTimeout(timeoutRef.current);

    const snapshot = Number(text);
    setResult(snapshot);

    timeoutRef.current = setTimeout(() => {
      if (snapshot % 2 === 0) {
        console.log("짝수 실행");
      } else {
        console.log("홀수 실행");
      }
    }, 2000)
  }

  return (
    <div>
      <input
        type="number"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button onClick={saveHandler}>[기록]</button>
      <button onClick={executeHandler}>[실행]</button>

      <p>현재 입력값: {text}</p>
      <p>실행 기준값: {result}</p>
      <p>기록된 값:</p>
      <ul>
        {Object.keys(saveRef.current).map((key) =>
          (<li key={key}>{key}</li>)
        )}
      </ul>
    </div>
  )
}

export default App
