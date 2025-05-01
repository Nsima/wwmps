'use client';

import React from 'react';

interface ReflectionOutputProps {
  reflection: string;
}

export default function ReflectionOutput({ reflection }: ReflectionOutputProps) {
  return (
    <div className="w-full min-h-[120px] border border-gray-200 bg-gray-50 p-4 rounded-md text-sm text-gray-800">
      {reflection ? (
        <p className="whitespace-pre-line">{reflection}</p>
      ) : (
        <p className="text-gray-400 italic">Your reflection will appear here...</p>
      )}
    </div>
  );
}
