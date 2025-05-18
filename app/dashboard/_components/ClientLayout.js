"use client";

import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { MessageCircle, SparklesIcon } from "lucide-react";
import ChatBotResponsive from "./ChatBotResponsive";

const ClientLayout = ({ children }) => {
  const [showChatBot, setShowChatBot] = useState(false);

  const handleToggleChatBot = () => {
    if (showChatBot) {
      const confirmClose = window.confirm(
        "Are you sure you want to close the chat?"
      );
      if (confirmClose) {
        setShowChatBot(false);
      }
    } else {
      setShowChatBot(true);
    }
  };

  return (
    <SessionProvider>
      <div className="h-screen flex flex-col overflow-hidden relative">
        <div className="flex w-full overflow-hidden">
          {/* Sidebar hidden on mobile (visible from md and up) */}
          <div className="hidden md:block">
            <Sidebar />
          </div>
          <main className="w-full overflow-auto scrollable-section">
            <Header />
            <div className="bg-white">{children}</div>
          </main>
        </div>

        {/* Chatbot Modal */}
        {showChatBot && (
          <div className="fixed right-6 bottom-20 w-full sm:w-96 h-[calc(100vh-100px)] bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-200 z-[999]">
            <ChatBotResponsive setShowChatBot={setShowChatBot} />
          </div>
        )}

        {/* AI Button */}
        <button
          onClick={handleToggleChatBot}
          className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 hover:scale-105 transition-transform duration-200 z-[999] animate-accordion-down hidden lg:block"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </SessionProvider>
  );
};

export default ClientLayout;
