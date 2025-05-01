'use client';

import { useState } from 'react';
//import ModelSelector from '@/components/ModelSelector';
//import QuestionInput from '@/components/QuestionInput';
//import ReflectionOutput from '@/components/ReflectionOutput';
//import SaveShareControls from '@/components/SaveShareControls';

export default function HomePage() {
  const [selectedPastor, setSelectedPastor] = useState('Pastor David Oyedepo');
  const [question, setQuestion] = useState('');
  const [reflection, setReflection] = useState('');

  return (
    <main className="min-h-screen bg-white text-gray-900 px-4 py-8 max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">
          What would <span className="text-blue-600">{selectedPastor}</span> say?
        </h1>
      </header>

      <section className="mb-6">
        {/* <ModelSelector selected={selectedPastor} onChange={setSelectedPastor} /> */}
      </section>

      <section className="mb-6">
       {/* <QuestionInput question={question} onChange={setQuestion} /> */}
      </section>

      <section className="mb-6 flex items-center justify-between gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            setReflection(`Reflection from ${selectedPastor} about: "${question}"`);
          }}
        >
          ✨ Submit
        </button>
       {/* <SaveShareControls reflection={reflection} /> */}
      </section>

      <hr className="my-6 border-gray-300" />

      <section>
      {/*  <ReflectionOutput reflection={reflection} /> */}
      </section>
    </main>
  );
}
