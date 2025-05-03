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
  const [showSidebar, setShowSidebar] = useState(false);
  const [showConversations, setShowConversations] = useState(false);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);



  const handleSend = () => {
    if (!question.trim()) return;
  
    const userMessage: ChatMessage = {
      sender: 'user',
      text: question.trim(),
    };
  
    const fullResponse = `Here’s what ${selectedPastor} might say about: "${question.trim()}"`;
  
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setTypingMessage('');
    setIsTyping(true);
  
    const words = fullResponse.split(' ');
    let currentWordIndex = 0;
  
    const interval = setInterval(() => {
      setTypingMessage((prev) => prev + ' ' + words[currentWordIndex]);
      currentWordIndex++;
  
      if (currentWordIndex === words.length) {
        clearInterval(interval);
        setMessages((prev) => [...prev, { sender: 'pastor', text: fullResponse }]);
        setIsTyping(false);
        setTypingMessage('');
      }
    }, 150); // adjust speed here (in ms)
  };
  

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
  className={`fixed top-0 left-0 h-screen w-[300px] bg-gray-900 text-white transform transition-transform duration-300 z-40
    ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}
>
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
        <div className="text-center w-full">
          <h1 className="text-2xl font-semibold mb-1">
            What would <span className="text-blue-700">{selectedPastor}</span> say?
          </h1>
          <div className="w-full max-w-xs mx-auto mt-2">
            <ModelSelector selected={selectedPastor} onChange={setSelectedPastor} />
          </div>
        </div>

          <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="text-sm px-3 py-1 rounded-md bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600"
          >
            {showSidebar ? 'Hide Conversations' : 'Show Conversations'}
          </button>
          <label className="switch">
            <input type="checkbox" onChange={() => document.documentElement.classList.toggle('dark')} />
            <span className="slider round"></span>
          </label>
        </div>
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

          {/* Typing animation preview */}
          {isTyping && (
            <div className="max-w-[70%] mr-auto px-4 py-2 rounded-lg text-sm bg-gray-200 dark:bg-gray-700 text-left italic text-gray-500">
              {typingMessage.trim()}
            </div>
          )}
        </div>

        {/* Input Area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center p-4 border-t dark:border-gray-700 bg-white dark:bg-zinc-900 sticky bottom-0 z-30"
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
      {showConversations && (
        <div className="absolute top-20 right-4 w-72 bg-white dark:bg-zinc-800 shadow-xl border dark:border-zinc-700 rounded-md p-4 z-50">
          <h2 className="text-sm font-semibold mb-2">Conversations</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            No previous conversations yet.
          </p>
          <button
            onClick={() => {
              setMessages([]);
              setShowConversations(false);
            }}
            className="text-sm w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            + New Conversation
          </button>
        </div>
      )}

    </div>
  );
}
