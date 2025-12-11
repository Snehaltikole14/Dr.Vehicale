"use client";

import React, { useState, useRef, useEffect } from "react";
import { FiArrowLeft, FiSend, FiMoreVertical } from "react-icons/fi";

const BASE_URL = "http://192.168.31.224:8080/api/chat";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

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

      const botMsg = {
        id: Date.now().toString() + "bot",
        text: data.response,
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "error",
          text: "Server error. Please try again!",
          sender: "bot",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white shadow relative">
      

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 rounded hover:bg-gray-100 relative"
          >
            <FiMoreVertical size={24} />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-6 top-16 bg-white shadow-md rounded-md w-40 z-50">
              <ul className="flex flex-col">
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Profile
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  Settings
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                  Logout
                </li>
              </ul>
            </div>
          )}

          <button
            onClick={() => window.history.back()}
            className="p-2 rounded hover:bg-gray-100"
          >
            <FiArrowLeft size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((item) => (
          <div
            key={item.id}
            className={`max-w-[75%] px-4 py-2 rounded-2xl my-2 ${
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
        <div className="text-center mb-2">
          <span className="animate-spin h-6 w-6 border-4 border-red-500 border-t-transparent rounded-full inline-block"></span>
        </div>
      )}

      {/* Input Box */}
      <div className="flex items-center bg-white p-3 border-t border-gray-300">
        <input
          className="flex-1 bg-gray-200 px-4 py-2 rounded-full mr-2 outline-none"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-red-600 p-3 rounded-full flex items-center justify-center"
        >
          <FiSend size={20} className="text-white" />
        </button>
      </div>
    </div>
  );
}
