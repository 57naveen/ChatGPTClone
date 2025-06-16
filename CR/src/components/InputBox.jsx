import { useState, useRef, useEffect } from "react";
import {
  Plus,
  SlidersHorizontal,
  Mic,
  Waves,
  SendHorizontal,
} from "lucide-react";

const InputBox = ({ onSend }) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="px-4 py-6 flex justify-center">
      <div
        className="w-full max-w-4xl rounded-4xl px-7 py-5 flex flex-col gap-3 transition-colors duration-300"
        style={{
          backgroundColor: "var(--inputbox-bg)",
          color: "var(--inputbox-text)",
        }}
      >
        {/* Dynamic Resizing Textarea */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask anything"
          className="bg-transparent outline-none text-lg resize-none overflow-hidden w-full px-2"
          style={{
            color: "var(--inputbox-text)",
            maxHeight: "500px",
            lineHeight: "1.5rem",
            caretColor: "var(--inputbox-text)",
            "::placeholder": {
              color: "var(--inputbox-placeholder)",
            },
          }}
        />

        {/* Icon Row Below Textarea */}
        <div className="flex items-start justify-between gap-3">
          {/* Left Icons */}
          <div
            className="flex items-center gap-2"
            style={{ color: "var(--inputbox-icon)" }}
          >
            <Plus size={20} className="cursor-pointer" />
            <div className="flex items-center gap-1 cursor-pointer">
              <SlidersHorizontal size={20} />
              <span className="text-lg ml-3">Tools</span>
            </div>
          </div>

          {/* Right Icons */}
          <div
            className="flex items-center gap-3"
            style={{ color: "var(--inputbox-icon)" }}
          >
            {input.trim() ? (
              <button onClick={handleSend} className="cursor-pointer">
                <SendHorizontal size={25} />
              </button>
            ) : (
              <>
                <Mic size={20} className="cursor-pointer" />
                <div
                  className="p-1 rounded-full cursor-pointer"
                  style={{
                    backgroundColor:
                      "var(--inputbox-icon)",
                    color: "var(--inputbox-bg)",
                  }}
                >
                  <Waves size={20} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputBox;
