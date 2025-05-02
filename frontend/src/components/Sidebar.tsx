'use client';

import { useState } from 'react';

export default function Sidebar({
  onNewConversation,
}: {
  onNewConversation: () => void;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`transition-all duration-300 ${
        collapsed ? 'w-[50px]' : 'w-[300px]'
      } h-screen bg-zinc-900 text-white fixed top-0 left-0 z-10 overflow-hidden`}
    >
      {/* Toggle Button */}
      <div className="relative">
        <button
          className="absolute top-4 right-[-12px] bg-zinc-700 p-1 rounded-full"
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle Sidebar"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {/* Content */}
      <div className={`pt-16 px-4 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <div className="mb-6">
          <p className="text-xs text-gray-400">Last Conversation</p>
          <p className="text-sm font-semibold">No conversation yet</p>
        </div>

        <button
          className="w-full bg-zinc-700 px-4 py-2 rounded text-sm hover:bg-zinc-600"
          onClick={onNewConversation}
        >
          + New Conversation
        </button>
      </div>
    </aside>
  );
}
