// "use client";

// import { useSession } from "next-auth/react";
// import { useState, useRef, useEffect } from "react";
// import { PaperAirplaneIcon, SparklesIcon } from "@heroicons/react/24/solid";
// import Loding from "../_components/Loding";
// import { SendHorizontal } from "lucide-react";

// export default function ChatbotResponsive() {
//   const { data: session, status } = useSession();
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   if (status === "loading") {
//     return <Loding />;
//   }

//   if (!session) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
//         <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center max-w-md">
//           <SparklesIcon className="w-12 h-12 text-white mx-auto mb-4 animate-pulse" />
//           <h2 className="text-2xl font-bold text-white mb-2">
//             Welcome to Finance AI
//           </h2>
//           <p className="text-white/80 mb-4">
//             Please sign in to start chatting with your financial assistant
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const userId = session.user.id;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!input.trim()) return;

//     const userMessage = input;
//     setLoading(true);
//     const newMessages = [...messages, { text: userMessage, isBot: false }];
//     setMessages(newMessages);
//     setInput("");

//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: userMessage, userId }),
//       });

//       if (!res.ok) throw new Error(await res.text());

//       const data = await res.json();
//       setMessages([
//         ...newMessages,
//         {
//           text: data.text,
//           isBot: true,
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ]);
//     } catch (error) {
//       console.error(error);
//       setMessages([
//         ...newMessages,
//         {
//           text: "⚠️ Connection issue detected. Please try again in a moment.",
//           isBot: true,
//           timestamp: new Date().toLocaleTimeString(),
//         },
//       ]);
//     } finally {
//       setLoading(false);
//       inputRef.current?.focus();
//     }
//   };

//   return (
//     <div className="flex flex-col p-0 m-0">
//       {/* Header */}
//       <header className="p-4 border-b  flex items-center justify-between ">
//         <div className="flex items-center space-x-3">
//           <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center">
//             <SparklesIcon className="w-6 h-6 text-violet-500" />
//           </div>
//           <div>
//             <h1 className=" font-semibold">Finance Assistant</h1>
//             <p className="text-xs ">AI-powered financial guidance</p>
//           </div>
//         </div>
//         <div className="flex items-center space-x-2">
//           <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//           <span className="text-sm text-gray-700">Online</span>
//         </div>
//       </header>

//       {/* Chat Area */}
//       <main className="overflow-y-auto p-4 space-y-4 custom-scrollbar h-[65vh]">
//         {messages.map((msg, i) => (
//           <div
//             key={i}
//             className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
//           >
//             <div
//               className={`max-w-[80%] p-4 rounded-2xl transition-all duration-200 ${
//                 msg.isBot
//                   ? "bg-gray-700 text-white"
//                   : "bg-indigo-600 text-white"
//               }`}
//             >
//               <p className="leading-relaxed">{msg.text}</p>
//               <div className="mt-2 text-xs text-gray-300 flex items-center justify-end space-x-2">
//                 {msg.isBot && <span className="text-indigo-300">AI</span>}
//                 <span>{msg.timestamp}</span>
//               </div>
//             </div>
//           </div>
//         ))}
//         {loading && (
//           <div className="flex justify-start">
//             <div className="bg-gray-700 p-4 rounded-2xl flex space-x-2 items-center">
//               <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
//               <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
//               <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
//               <span className="text-sm text-gray-300 ml-2">Analyzing...</span>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </main>

//       {/* Input Area */}
//       <footer className="p-4 border-t">
//         <form onSubmit={handleSubmit} className="relative">
//           <input
//             ref={inputRef}
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask about budgets, expenses, or investments..."
//             className="w-full p-4 pr-12  text-black rounded-xl border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
//             disabled={loading}
//             autoFocus
//           />
//           <button
//             type="submit"
//             disabled={loading || !input.trim()}
//             className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400 transition-colors disabled:opacity-50"
//           >
//             <SendHorizontal className="w-6 h-6" />
//           </button>
//         </form>
//       </footer>

//       {/* Custom Scrollbar Styles */}
//       <style jsx global>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: rgba(255, 255, 255, 0.05);
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: rgba(255, 255, 255, 0.2);
//           border-radius: 4px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: rgba(255, 255, 255, 0.3);
//         }
//       `}</style>
//     </div>
//   );
// }
"use client";

import { useSession } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { SparklesIcon } from "@heroicons/react/24/solid";
import Loding from "../_components/Loding";
import { SendHorizontal } from "lucide-react";

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
        block: "end", // Ensures alignment to bottom
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50); // Allows DOM to update before scrolling
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

  return (
    <div className="flex flex-col h-[85vh] bg-white overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-gray-200 flex items-center justify-between">
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
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
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
              <span className="text-sm text-gray-600">Analyzing...</span>
            </div>
          </div>
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
