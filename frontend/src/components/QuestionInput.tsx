'use client';

import React from 'react';

interface QuestionInputProps {
  question: string;
  onChange: (text: string) => void;
}

export default function QuestionInput({ question, onChange }: QuestionInputProps) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Ask a question or describe a scenario and see the opinion of the man of God according to AI
      </label>
      <textarea
        className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 h-28"
        placeholder="e.g., What do you think about this Tinubu administration?"
        value={question}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
