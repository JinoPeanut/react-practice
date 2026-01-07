import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {
  const [text, setText] = useState("");
  const [resultText, setResult] = useState("");
  const isTypingRef = useRef(false);
  const timeoutRef = useRef(null);

  const inputHandle = (e) => {
    const value = e.target.value;
    setText(value);

    if (!isTypingRef.current) {
      console.log("입력 시작");
      isTypingRef.current = true;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("검색 요청")
      isTypingRef.current = false;
      setResult(value);
    }, 1000)
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
      {text ? (<p>입력중...</p>) : (<p></p>)}
      <p>검색 결과: {resultText}</p>
    </div>
  )
}

export default App
