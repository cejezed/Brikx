// components/HandoffBannerTrigger.tsx
'use client';

import { useState } from 'react';
import { UserCircle } from 'lucide-react';
import { HumanHandoffModal } from '@/app/wizard/components/HumanHandoffModal';

export default function HandoffBannerTrigger() {
  const [showHandoffModal, setShowHandoffModal] = useState(false);

  return (
    <>
      {/* Human Handoff Banner (exact zoals je snippet) */}
      <div className="border-t bg-blue-50 px-3 py-2 flex items-center gap-2 text-xs rounded-b-xl mt-4">
        <span className="text-lg text-[#35515a] mb-2">💡 Loop je vast?</span>
        <button
          onClick={() => setShowHandoffModal(true)}
          className="text-blue-600 hover:text-blue-1200 font-large underline flex items-center gap-1 transition-colors"
        >
          <UserCircle className="w-3 h-3" />
          Vraag aan architect
        </button>
      </div>

      {/* Verwijzing naar de bestaande modal in /app/wizard/components */}
      <HumanHandoffModal
        isOpen={showHandoffModal}
        onClose={() => setShowHandoffModal(false)}
      />
    </>
  );
}
