'use client';

import { useState } from 'react';
import { UserCircle } from 'lucide-react';
// ⬇️ wijzig: default import i.p.v. named import
import HumanHandoffModal from '@/app/wizard/components/HumanHandoffModal';

export default function HandoffBannerTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
      >
        <UserCircle className="h-4 w-4" />
        Vraag een architect
      </button>

      <HumanHandoffModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
