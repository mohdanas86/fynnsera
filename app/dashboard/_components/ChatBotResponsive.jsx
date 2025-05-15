"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  PaperAirplaneIcon,
  ChatBubbleBottomCenterIcon,
} from "@heroicons/react/24/solid";
import Loading from "../_components/Loading";
import { SendHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatBotResponsive({ setShowChatBot }) {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // Memoize messages to avoid unnecessary recomputation during re-renders.
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [memoizedMessages]);

  if (status === "loading") {
    return <Loading />;
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-semibold mb-4">🔒 Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to use the Finance Assistant.
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
    const newMessages = [
      ...messages,
      { text: userMessage, isBot: false, id: Date.now() },
    ];
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
        { text: data.text, isBot: true, id: Date.now() + 1 },
      ]);
    } catch (error) {
      console.error(error);
      setMessages([
        ...newMessages,
        {
          text: "⚠️ Sorry, I'm having trouble connecting. Please try again later.",
          isBot: true,
          id: Date.now() + 2,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <header className="bg-slate-100 p-4 py-2 shadow flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center space-x-3">
            {/* <ChatBubbleBottomCenterIcon className="w-4 h-4 " /> */}
            <h1 className=" font-bold">Finance Assistant</h1>
          </div>
          <p className="text-gray-600 text-sm  opacity-90">
            AI-powered financial guidance
          </p>
        </div>
        <Button onClick={() => setShowChatBot((e) => !e)}>
          <X />
        </Button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {memoizedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-xl shadow transition-transform transform  ${
                msg.isBot
                  ? "bg-white text-gray-800 border border-gray-200"
                  : "bg-green-600 text-white"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              <div className="mt-1 text-xs text-right opacity-70">
                {msg.isBot ? "Assistant" : "You"}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl shadow flex space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about budgets, expenses, or investments..."
            className="w-full p-4 pr-14 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
          >
            <SendHorizontal className="w-6 h-6" />
          </button>
        </form>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}
