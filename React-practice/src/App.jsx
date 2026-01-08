import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

function App() {

  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isTyping, setTyping] = useState(false);

  const isTypingRef = useRef();
  const timeoutRef = useRef(null);

  const inputHandle = (e) => {

    const value = e.target.value;
    setText(value);

    if (!isTypingRef.current) {
      console.log("입력 시작");
      isTypingRef.current = true;
    }

    setTyping(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      console.log("검색 요청");
      isTypingRef.current = false;
      setTyping(false);
      setLoading(true);

      setTimeout(() => {
        setLoading(false);
        setResult(value);
      }, 1000)
    }, 1500)
  }

  return (
    <div>
      <input
        value={text}
        onChange={inputHandle}
      />
      {isTyping ? <p>입력중입니다...</p> : <p></p>}
      {isLoading && <p>로딩중...</p>}
      {<p>검색결과: {result}</p>}
    </div>
  )
}

export default App
