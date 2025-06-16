import { useEffect, useRef } from "react";
import Message from "./Message";

const ChatWindow = ({ messages,isTyping  }) => {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages,isTyping ]);

  const lastIndex = messages.length - 1;

  return (
    <div className="flex justify-center flex-1 overflow-y-auto px-4 py-6 transition-colors duration-300">
      <div className="w-full max-w-4xl space-y-4 break-words px-2 sm:px-4">
        {messages.map((msg, index) => (
          <Message
            key={index}
            text={msg.text}
            isUser={msg.isUser}
            isTyping={
              !msg.isUser && index === lastIndex // Only apply typing to the last bot message
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
