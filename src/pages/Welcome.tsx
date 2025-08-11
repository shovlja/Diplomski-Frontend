// src/pages/Welcome.tsx
import React from 'react';
import { useWelcomeMessage } from '../hooks/useWelcomeMessage';

export default function Welcome() {
  const { message, loading, error } = useWelcomeMessage();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6 bg-blue-200 rounded shadow-md text-center">
      <h2 className="text-xl font-bold mb-2">Backend says:</h2>
      <p className="text-lg">{message}</p>
    </div>
  );
}
