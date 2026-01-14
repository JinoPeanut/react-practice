import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");

  const timeoutRef = useRef(null);
  const requestIdRef = useRef(0);
  const cacheRef = useRef({});

  const inputHandle = (e) => {
    const value = e.target.value;
    setText(value);

    if (value === "") {
      setStatus("idle");
      return;
    }

    if (cacheRef.current[value]) {
      setResult(cacheRef.current[value]);
      return;
    }

    requestIdRef.current += 1;
    const request = requestIdRef.current;

    clearTimeout(timeoutRef.current);

    setStatus("typing");

    timeoutRef.current = setTimeout(() => {
      setStatus("loading");
      if (request === requestIdRef.current) {
        console.log("검색 요청");
        const fakeResult = value;
        cacheRef.current[value] = fakeResult;
        setResult(fakeResult);
      }
    }, 1000)
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
      {status === "typing" && (<p>입력중...</p>)}
      {status === "loading" && <p>로딩중...</p>}
      {result && <p>겸색 결과: {result}</p>}
    </div>
  )
}

export default App
