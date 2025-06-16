import { useEffect, useRef, useState } from "react";

const Message = ({ text, isUser, isTyping }) => {
  const [displayedText, setDisplayedText] = useState(
    isUser || !isTyping ? text : ""
  );

   const messageRef = useRef();

  useEffect(() => {
    if (isUser || !isTyping) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;

      messageRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });

      if (i >= text.length) clearInterval(interval);
    }, 20); // Typing speed (ms per character)

    return () => clearInterval(interval);
  }, [text, isUser, isTyping]);

  return (
    <div  ref={messageRef} className={`flex ${isUser ? "justify-end" : "justify-start"} my-2`}>
     <div
        className={`max-w-[95%] px-4 py-4 mt-2 rounded-xl text-lg`}
        style={{
          backgroundColor: isUser ? "var(--user-msg-bg)" : "var(--bot-msg-bg)",
          color: isUser ? "var(--user-msg-text)" : "var(--bot-msg-text)",
        }}
      >
        {displayedText}
      </div>
    </div>
  );
};

export default Message;
