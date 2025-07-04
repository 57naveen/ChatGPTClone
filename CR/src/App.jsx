import { useEffect, useState } from 'react';
import './App.css';
import ChatWindow from './components/ChatWindow';
import InputBox from './components/InputBox';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

function App() {
  const [messages, setMessages] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleSend = async (text) => {
    if (!text?.trim()) return;

    // Add user message + placeholder bot message
    setMessages((prev) => [
      ...prev,
      { text, isUser: true },
      { text: "", isUser: false, isTyping: true },
    ]);

    try {
      const response = await fetch("http://localhost:8000/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          text: data.response || "No response from Gemini.",
          isUser: false,
          isTyping: false,
        };
        return updated;
      });
    } catch (error) {
      console.error("Error:", error.message);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          text: "Error: Failed to get response from Gemini.",
          isUser: false,
          isTyping: false,
        };
        return updated;
      });
    }
  };

  return (
    <div className="flex h-screen transition-colors duration-300">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Topbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <ChatWindow messages={messages} />
        <InputBox onSend={handleSend} />
      </div>
    </div>
  );
}

export default App;
