import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("idle");

  const requestIdRef = useRef(0);
  const allTextRef = useRef({});
  const timeoutRef = useRef(null);

  const inputHandle = (e) => {
    const value = e.target.value;
    const random = Math.floor(Math.random() * 2000) + 500;
    setText(value);

    if (value === "") {
      setStatus("idle");
      return;
    }

    if (allTextRef.current[value]) {
      setStatus("success");
      setResult(allTextRef.current[value]);
      return;
    }

    requestIdRef.current += 1;
    const request = requestIdRef.current;
    setStatus("loading");

    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      if (request === requestIdRef.current) {
        const fakeResult = value;
        allTextRef.current[value] = fakeResult;
        setStatus("success");
        setResult(fakeResult);
      }
    }, random)


    allTextRef.current[value] = result;
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
      {status === "loading" && <p>로딩중...</p>}
      {status === "success" && <p>검색결과: {result}</p>}
    </div>
  )
}

export default App
