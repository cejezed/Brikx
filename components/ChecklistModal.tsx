'use client';

import { useState, FormEvent } from 'react';

// Props die het component kan ontvangen
interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function ChecklistModal({ isOpen, onClose, onSubmit }: ChecklistModalProps) {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Als de modal niet open is, toon dan niets
  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // E-mail validatie
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setEmailError('Vul een geldig e-mailadres in.');
      return;
    }
    // Roep de onSubmit functie aan die vanuit de parent komt
    onSubmit(email);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={onClose} // Klik buiten de modal om te sluiten
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()} // Voorkom dat klikken in de modal de modal sluit
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
          aria-label="Sluiten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="text-2xl font-bold text-[#0d3d4d]">Download de Gratis Checklist</h3>
        <p className="text-gray-600 mt-2">Vul je e-mailadres in en ontvang de checklist direct in je inbox.</p>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mailadres
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError(null) // Reset error bij typen
              }}
              className={`mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 ${
                emailError ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-[#0a7266]'
              }`}
              placeholder="jij@voorbeeld.com"
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center rounded-full bg-[#0a7266] text-white font-semibold px-6 py-3 hover:opacity-90 transition-opacity"
          >
            Download Nu
          </button>
        </form>
      </div>
    </div>
  );
}