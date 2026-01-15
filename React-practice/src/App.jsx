import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");

  const timeoutRef = useRef(null);
  const requestIdRef = useRef(0);

  const inputHandle = (e) => {
    const delay = Math.floor(Math.random() * 1501) + 500;
    const value = e.target.value;
    setText(value);

    if (!value) {
      setStatus("idle");
      return;
    }

    setStatus("typing");

    clearTimeout(timeoutRef.current);

    const request = ++requestIdRef.current;

    timeoutRef.current = setTimeout(() => {
      if (request !== requestIdRef.current) return;
      setStatus("searching");

      setTimeout(() => {
        if (request !== requestIdRef.current) return;
        setStatus("success");
        setResult(value);
      }, delay)

    }, 1000)
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}

      />
      {status === "typing" && <p>입력중...</p>}
      {status === "searching" && <p>검색중...</p>}
      {status === "success" && text && <p>확정 결과: {result}</p>}
    </div>
  )
}

export default App
