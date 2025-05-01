'use client';

import { useState } from 'react';
//import ModelSelector from '@/components/ModelSelector';
//import QuestionInput from '@/components/QuestionInput';
//import ReflectionOutput from '@/components/ReflectionOutput';
//import SaveShareControls from '@/components/SaveShareControls';
import { BookOpenIcon, SparklesIcon } from '@heroicons/react/24/solid';

export default function HomePage() {
  const [selectedPastor, setSelectedPastor] = useState('Pastor David Oyedepo');
  const [question, setQuestion] = useState('');
  const [reflection, setReflection] = useState('');

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-blue-50 text-gray-900 px-4 py-8 max-w-2xl mx-auto font-sans">
      <header className="mb-10 text-center">
        <div className="flex justify-center mb-2">
          <SparklesIcon className="h-8 w-8 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold">
          What would <span className="text-blue-700">{selectedPastor}</span> say?
        </h1>
        <p className="text-sm text-gray-500 mt-2">Get ethical and spiritual guidance drawn from real sermons</p>
      </header>

      <section className="mb-6">
        {/*<ModelSelector selected={selectedPastor} onChange={setSelectedPastor} /> */}
      </section>

      <section className="mb-6">
        {/*<QuestionInput question={question} onChange={setQuestion} /> */}
      </section>

      <section className="mb-6 flex items-center justify-between gap-4">
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
          onClick={() => {
            setReflection(`Reflection from ${selectedPastor} about: "${question}"`);
          }}
        >
          <SparklesIcon className="h-5 w-5" />
          Submit
        </button>
        {/*<SaveShareControls reflection={reflection} /> */}
      </section>

      <hr className="my-6 border-gray-300" />

      <section className="bg-white shadow-sm rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold">
          <BookOpenIcon className="h-6 w-6" />
          Reflection
        </div>
        {/*<ReflectionOutput reflection={reflection} /> */}
      </section>
    </main>
  );
}
