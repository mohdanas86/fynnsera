"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Loding from "../_components/Loding";
import { SendHorizontal } from "lucide-react";

const financePrompts = [
  "How can I manage my monthly budget?",
  "What are some investment tips for beginners?",
  "How do I reduce my expenses?",
  "What's the current market trend?",
];

export default function ChatbotResponsive() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  if (status === "loading") {
    return <Loding />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md border border-gray-200">
          <SparklesIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Finance AI
          </h2>
          <p className="text-gray-600 mb-4">
            Please sign in to access your financial assistant
          </p>
        </div>
      </div>
    );
  }

  const userId = session.user.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setLoading(true);
    const newMessages = [...messages, { text: userMessage, isBot: false }];
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, userId }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setMessages([
        ...newMessages,
        {
          text: data.text,
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        {
          text: "⚠️ Please try again. There was an issue processing your request.",
          isBot: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handler for prompt click: set the input and optionally auto-submit
  const handlePromptClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[85vh] bg-white overflow-hidden">
      {/* Header */}
      <header className="lg:p-4 lg:pt-0 pb-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-800">Finance Assistant</h1>
            <p className="text-xs text-gray-500">
              AI-powered financial guidance
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600">Online</span>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Try one of these finance questions:
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {financePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.isBot ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[90%] p-3 rounded-xl text-sm ${
                    msg.isBot
                      ? "bg-gray-50 border border-gray-200 text-gray-800"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <div
                    className={`mt-1 text-xs flex gap-2 items-center justify-end ${
                      msg.isBot ? "text-gray-500" : "text-indigo-100"
                    }`}
                  >
                    {msg.isBot && <span>Assistant</span>}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex gap-2 items-center">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                  {/* <span className="text-sm text-gray-600">Analyzing...</span> */}
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-[1px]"></div>
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budgets, expenses, or investments..."
            className="w-full p-3 pr-12 bg-white text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 disabled:opacity-50"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
