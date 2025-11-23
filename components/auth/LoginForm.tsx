"use client";
import React, { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      // Stuur de gebruiker terug naar de wizard of het dashboard
      router.push('/wizard'); 
      router.refresh(); // Zorgt dat de server-sessie wordt bijgewerkt
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h3>Inloggen</h3>
      {error && <p className="text-red-600">{error}</p>}
      
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full rounded border px-3 py-2"
      />
      <input
        type="password"
        placeholder="Wachtwoord"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full rounded border px-3 py-2"
      />
      <button type="submit" className="brx-pill teal">
        Login
      </button>
    </form>
  );
}