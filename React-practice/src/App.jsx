import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!text) {
      return;
    }

    setStatus("typing");

    const timeout = setTimeout(() => {
      console.log("검색중...");
      setStatus("loading");
    }, 800)

    return () => {
      clearTimeout(timeout);
    }
  }, [text])

  useEffect(() => {
    if (status !== "loading") return;

    const delay = Math.floor(Math.random() * 1001) + 500;

    const callApi = setTimeout(() => {
      console.log("API 요청...");
      setStatus("success");
      setResult(text);

    }, delay)

    return () => clearTimeout(callApi);

  }, [status])

  return (
    <div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {status === "typing" && <p>입력중...</p>}
      {status === "loading" && <p>검색중...</p>}
      {status === "success" && <p>결과: {result}</p>}
    </div>
  )
}

export default App
