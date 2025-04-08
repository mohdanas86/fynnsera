"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Loding from "../_components/Loding";
import { SendHorizontal } from "lucide-react";
import { useMyContext } from "@/context/MyContext";

const financePrompts = [
  "How do I build an emergency fund effectively?",
  "What financial habits lead to long-term wealth?",
  "How can I pay off debt faster and stay debt-free?",
  "What are the best budgeting methods for beginners?",
  "How do I improve my credit score quickly?",
];

export default function ChatbotResponsive() {
  const { data: session, status } = useSession();
  const { userTransaction } = useMyContext();
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

    const userMessage = {
      text: input,
      isBot: false,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.text, userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
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
      setMessages((prev) => [
        ...prev,
        {
          text: `⚠️ ${error.message}`,
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

  const handlePromptClick = (prompt) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-[85vh] bg-white overflow-hidden">
      <header className="lg:p-4 lg:pt-0 pb-4 lg:border-b border-gray-200 flex items-center justify-between">
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

      <main className="flex-1 overflow-y-auto lg:p-4 space-y-4">
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
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-800 transition"
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
                  className={`max-w-[100%] p-3 rounded-md text-sm ${
                    msg.isBot
                      ? "bg-gray-50 border border-gray-200 text-gray-800"
                      : "bg-teal-600 text-white"
                  }`}
                >
                  <p className="break-words">{msg.text}</p>
                  <div
                    className={`mt-1 text-xs flex gap-2 items-center justify-end ${
                      msg.isBot ? "text-gray-500" : "text-indigo-100"
                    }`}
                  >
                    {msg.isBot ? "Assistant" : "You"}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex gap-2 items-center">
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce delay-200" />
                  <span className="text-sm text-teal-800">
                    Analyzing your finances...
                  </span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-[1px]"></div>
      </main>

      <footer className="lg:p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budgets, expenses, or investments..."
            className="w-full p-3 pr-12 bg-white text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
            disabled={loading}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-800 disabled:opacity-50"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
