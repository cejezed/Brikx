// components/pdf/DownloadPdfButton.tsx
'use client';

import { useState } from 'react';
import { useWizardState } from '@/lib/stores/useWizardState';
import type { DocumentStatus } from '@/app/wizard/components/DossierChecklist';

interface DownloadPdfButtonProps {
  documentStatus?: DocumentStatus | null;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function DownloadPdfButton({
  documentStatus,
  onSuccess,
  onError,
}: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ✅ Read your wizard state
  const chapterAnswers = useWizardState((s) => s.chapterAnswers);
  const mode = useWizardState((s) => s.mode);

  const isPremium = mode === 'PREMIUM';

  const handleDownload = async (emailAddress?: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('[PDF Download] Starting...', {
        isPremium,
        hasEmail: !!emailAddress,
      });

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterAnswers: chapterAnswers,
          isPremium: isPremium,
          documentStatus: documentStatus || null,
          email: emailAddress || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate PDF');
      }

      // ✅ Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pve-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setShowEmailForm(false);
      setEmail('');
      
      if (onSuccess) onSuccess();

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

      console.log('[PDF Download] Success!');
    } catch (err: any) {
      const message = err.message || 'Failed to download PDF';
      console.error('[PDF Download] Error:', message);
      setError(message);
      if (onError) onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Voer een geldig e-mailadres in');
      return;
    }

    await handleDownload(email);
  };

  return (
    <div className="space-y-4">
      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-900 px-4 py-3 rounded-lg">
          ✅ PDF succesvol gegenereerd! De download is gestart.
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-900 px-4 py-3 rounded-lg">
          ⚠️ Fout: {error}
        </div>
      )}

      {/* Email form */}
      {showEmailForm && (
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">
              E-mailadres (optioneel)
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="je@voorbeeld.nl"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0d3d4d] focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              We sturen je een link om het document later te downloaden
            </p>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0d3d4d] text-white px-4 py-2 rounded-lg hover:bg-[#0a2a37] disabled:opacity-50 font-medium transition"
            >
              {loading ? 'Genererend...' : 'Download met email'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(false);
                handleDownload();
              }}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium transition"
            >
              Zonder email
            </button>
          </div>
        </form>
      )}

      {/* Main button */}
      {!showEmailForm && (
        <button
          onClick={() => setShowEmailForm(true)}
          disabled={loading}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition text-white ${
            isPremium
              ? 'bg-[#0d3d4d] hover:bg-[#0a2a37]'
              : 'bg-gray-600 hover:bg-gray-700'
          } disabled:opacity-50`}
        >
          {loading ? (
            <>
              <span className="inline-block animate-spin mr-2">⚙️</span>
              Genererend...
            </>
          ) : (
            <>📥 Download Programma van Eisen (PDF)</>
          )}
        </button>
      )}

      {/* Info box */}
      <div className={`rounded-lg p-4 ${isPremium ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
        <p className="text-sm text-gray-700">
          {isPremium ? (
            <>
              <strong>✅ Premium versie:</strong> Inclusief alle details, budgetgegevens en technische specificaties.
            </>
          ) : (
            <>
              <strong>🔒 Preview versie:</strong> Dit is een vereenvoudigde versie van je PvE. 
              Upgrade naar Premium voor volledige informatie.
            </>
          )}
        </p>
      </div>
    </div>
  );
}