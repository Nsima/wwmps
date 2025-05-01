'use client';

import { useEffect, useState } from 'react';
import ModelSelector from '@/components/ModelSelector';
import QuestionInput from '@/components/QuestionInput';
import ReflectionOutput from '@/components/ReflectionOutput';

export default function HomePage() {
  const [selectedPastor, setSelectedPastor] = useState('Pastor David Oyedepo');
  const [question, setQuestion] = useState('');
  const [reflection, setReflection] = useState('');

  // Simulate fetching reflection automatically
  useEffect(() => {
    if (question.trim()) {
      setReflection(`"${selectedPastor}" would say: "${question}"`);
    } else {
      setReflection('');
    }
  }, [selectedPastor, question]);

  return (
    <main className="min-h-screen bg-white text-gray-900 px-4 py-8 max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">
          What would <span className="text-blue-600">{selectedPastor}</span> say?
        </h1>
      </header>

      <section className="mb-6">
        <ModelSelector selected={selectedPastor} onChange={setSelectedPastor} />
      </section>

      <section className="mb-6">
        <QuestionInput question={question} onChange={setQuestion} />
      </section>

      <hr className="my-6 border-gray-200" />

      <section>
        <ReflectionOutput reflection={reflection} />
      </section>
    </main>
  );
}
