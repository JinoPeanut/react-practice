import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [status, setStatus] = useState("idle");
  const timeoutRef = useRef(null);
  const successRef = useRef(null);

  const inputHandle = (e) => {
    const value = e.target.value;
    setText(value);

    if (value === "") {
      setStatus("idle");
      return;
    }

    setStatus("typing");

    clearTimeout(timeoutRef.current);
    clearTimeout(successRef.current);

    timeoutRef.current = setTimeout(() => {
      setStatus("loading");

      successRef.current = setTimeout(() => {
        setStatus("success");
      }, 1500)
    }, 800)
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
      {status === "typing" && <p>입력중...</p>}
      {status === "loading" && <p>로딩중...</p>}
      {status === "success" && text && <p>검색 결과: {text}</p>}
    </div>
  )
}

export default App
