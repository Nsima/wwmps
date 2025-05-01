'use client';

import React from 'react';

interface ModelSelectorProps {
  selected: string;
  onChange: (model: string) => void;
}

const pastors = [
  'Pastor David Oyedepo',
  'Pastor Enoch Adeboye',
  'Pastor Biodun Fatoyinbo',
];

export default function ModelSelector({ selected, onChange }: ModelSelectorProps) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select a Pastor
      </label>
      <select
        className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
      >
        {pastors.map((pastor) => (
          <option key={pastor} value={pastor}>
            {pastor}
          </option>
        ))}
      </select>
    </div>
  );
}
