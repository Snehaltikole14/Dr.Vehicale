"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiSend, FiMoreVertical } from "react-icons/fi";

const BASE_URL = "https://dr-vehicle-backend.onrender.com/api/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "bot",
          text: data.response,
          sender: "bot",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "err",
          text: "Server error. Please try again!",
          sender: "bot",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      {/* Chat Container */}
      <div className="flex flex-col w-full max-w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b sticky top-0 bg-white z-50">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded hover:bg-gray-100"
          >
            <FiArrowLeft size={22} />
          </button>

          <h2 className="font-semibold text-sm sm:text-base">
            Dr Vehicle Assistant
          </h2>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <FiMoreVertical size={22} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg text-sm">
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </div>
                <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 bg-gray-50">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`w-fit max-w-[85%] sm:max-w-[75%] px-4 py-2 rounded-2xl mb-2 text-sm sm:text-base ${
                item.sender === "user"
                  ? "bg-red-500 text-white ml-auto rounded-br-none"
                  : "bg-gray-200 text-black mr-auto rounded-bl-none"
              }`}
            >
              {item.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Loader */}
        {loading && (
          <div className="text-center py-2">
            <span className="animate-spin h-6 w-6 border-4 border-red-500 border-t-transparent rounded-full inline-block"></span>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 sm:px-4 py-3 border-t bg-white">
          <input
            className="flex-1 bg-gray-200 px-4 py-2 rounded-full outline-none text-sm sm:text-base"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage} className="bg-red-600 p-3 rounded-full">
            <FiSend size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
