'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface OnboardingHintProps {
  page: string;
  icon: string;
  title: string;
  message: string;
}

const ONBOARDED_KEY = 'emetis:onboarded';

export function OnboardingHint({ page, icon, title, message }: OnboardingHintProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const isOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
      if (isOnboarded) return;
      const seenKey = `emetis:seen:hint:${page}`;
      const alreadySeen = localStorage.getItem(seenKey) === 'true';
      if (!alreadySeen) {
        setVisible(true);
      }
    } catch {
      // localStorage not available
    }
  }, [page]);

  function dismiss() {
    try {
      const seenKey = `emetis:seen:hint:${page}`;
      localStorage.setItem(seenKey, 'true');
    } catch {}
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="mx-4 mt-3 mb-1 bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex items-start gap-3 shadow-sm">
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-indigo-900">{title}</p>
        <p className="text-xs text-indigo-700 mt-0.5 leading-relaxed">{message}</p>
      </div>
      <button
        onClick={dismiss}
        className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-colors"
        aria-label="Dispensar dica"
      >
        <X size={13} className="text-indigo-600" />
      </button>
    </div>
  );
}
