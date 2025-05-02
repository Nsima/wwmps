'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ModelSelector';

interface ChatMessage {
  sender: 'user' | 'pastor';
  text: string;
}

export default function ChatbotLayout() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const [selectedPastor, setSelectedPastor] = useState('Pastor David Oyedepo');

  const handleSend = () => {
    if (!question.trim()) return;
    const userMessage: ChatMessage = { sender: 'user', text: question.trim() };
    const botMessage: ChatMessage = {
      sender: 'pastor',
      text: `Here’s what ${selectedPastor} might say about: "${question.trim()}"`,
    };
    setMessages([...messages, userMessage, botMessage]);
    setQuestion('');
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-[300px] bg-gray-900 text-white hidden md:block">
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4">Conversations</h2>
          <button className="bg-gray-700 px-4 py-2 rounded mb-4">New Conversation</button>
          <div>
            <p className="text-sm font-semibold">Last Conversation:</p>
            <p className="text-xs text-gray-400">No conversation yet</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-zinc-900 text-black dark:text-white">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-zinc-800">
          <h1 className="text-xl font-semibold">
            What would <ModelSelector selected={selectedPastor} onChange={setSelectedPastor} /> say?
          </h1>
          <label className="switch">
            <input type="checkbox" onChange={() => document.documentElement.classList.toggle('dark')} />
            <span className="slider round"></span>
          </label>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${
                msg.sender === 'user'
                  ? 'ml-auto bg-blue-100 dark:bg-blue-700 text-right'
                  : 'mr-auto bg-gray-200 dark:bg-gray-700 text-left'
              }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center p-4 border-t dark:border-gray-700"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-l bg-gray-100 dark:bg-zinc-800 text-black dark:text-white focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 text-white rounded-r hover:bg-gray-700"
          >
            ↑
          </button>
        </form>
      </div>
    </div>
  );
}
