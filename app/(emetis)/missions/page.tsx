'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { MissionBadge, LevelBadge, GlyphFlame, GlyphTarget, GlyphLight } from '@/components/emetis-icons/missions';
import { IconTrophy } from '@/components/emetis-icons';
import type { MissionAction } from '@/lib/gamification';

type MissionsProgress = {
  total: number; level: string; weekPoints: number;
  nextLevelName: string | null; nextLevelMin: number | null;
  missions: { action: MissionAction; label: string; points: number; emoji: string; completed: boolean }[];
  currentStreak: number; longestStreak: number; checkedInToday: boolean;
};

const LEVEL_STYLES: Record<string, { bg: string; bar: string; text: string; border: string }> = {
  semente: { bg: 'bg-slate-50', bar: 'bg-slate-400', text: 'text-slate-700', border: 'border-slate-200' },
  broto:   { bg: 'bg-emerald-50', bar: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' },
  árvore:  { bg: 'bg-blue-50', bar: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200' },
  fruto:   { bg: 'bg-violet-50', bar: 'bg-violet-500', text: 'text-violet-700', border: 'border-violet-200' },
  luz:     { bg: 'bg-amber-50', bar: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' },
};
const LEVEL_HEX: Record<string, string> = {
  semente: '#334155', broto: '#047857', árvore: '#1D4ED8', fruto: '#6D28D9', luz: '#B45309',
};
const LEVELS_ORDER = ['semente', 'broto', 'árvore', 'fruto', 'luz'];
const LEVEL_MINS = [0, 100, 300, 600, 1000];

export default function MissionsPage() {
  const { data: session } = useSession();
  const isGuest = session?.user?.type === 'guest';
  const [missions, setMissions] = useState<MissionsProgress | null>(null);

  useEffect(() => {
    if (isGuest) return;
    fetch('/api/missions').then((r) => r.json()).then(setMissions).catch(() => {});
  }, [isGuest]);

  if (isGuest) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
        <LevelBadge level="semente" size={56} />
        <p className="text-slate-500 font-medium">Crie uma conta pra acompanhar suas missões e sua sequência.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pb-24">
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold text-slate-800">Missões</h1>

        {!missions && (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
          </div>
        )}

        {/* Nível & XP — card destacado */}
        {missions && (() => {
          const style = LEVEL_STYLES[missions.level] ?? LEVEL_STYLES.semente;
          const levelColor = LEVEL_HEX[missions.level] ?? LEVEL_HEX.semente;
          const prevLevelIdx = LEVELS_ORDER.indexOf(missions.level);
          const currentMin = LEVEL_MINS[prevLevelIdx] ?? 0;
          const nextMin = missions.nextLevelMin ?? null;
          const xpInLevel = missions.total - currentMin;
          const xpNeeded = nextMin ? nextMin - currentMin : null;
          const pct = xpNeeded ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100;
          return (
            <div className={`rounded-2xl border p-4 ${style.bg} ${style.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <LevelBadge level={missions.level} color={levelColor} size={40} />
                  <div>
                    <p className={`text-base font-bold capitalize ${style.text}`}>{missions.level}</p>
                    <p className="text-xs text-slate-400">{missions.total} XP acumulado</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                    {missions.weekPoints} pts esta semana
                  </span>
                  {missions.currentStreak > 0 && (
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                      style={{ background: 'var(--em-gold-400)', color: '#7C4A03' }}
                      title={`Recorde: ${missions.longestStreak} dias`}
                    >
                      <GlyphFlame size={12} /> {missions.currentStreak} {missions.currentStreak === 1 ? 'dia' : 'dias'}
                      {!missions.checkedInToday && ' · faça algo hoje!'}
                    </span>
                  )}
                </div>
              </div>
              {xpNeeded ? (
                <>
                  <div className="w-full bg-white/70 rounded-full h-3 border border-white shadow-inner overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${style.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
                    <span>{xpInLevel} / {xpNeeded} XP</span>
                    {missions.nextLevelName && (
                      <span>Próximo: <span className={`font-semibold capitalize ${style.text}`}>{missions.nextLevelName}</span></span>
                    )}
                  </div>
                </>
              ) : (
                <p className={`text-xs font-semibold mt-1 flex items-center gap-1 ${style.text}`}>
                  <GlyphLight size={13} /> Nível máximo atingido!
                </p>
              )}
            </div>
          );
        })()}

        {/* Missões Semanais */}
        {missions && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <GlyphTarget size={17} className="text-indigo-600" /> Missões da Semana
              </h3>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full">
                {missions.weekPoints} pts esta semana
              </span>
            </div>

            {(() => {
              const completed = missions.missions.filter((m) => m.completed).length;
              const total = missions.missions.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              return (
                <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-600">{completed} de {total} missões esta semana</span>
                    <span className="text-xs font-bold text-indigo-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              {missions.missions.map((m) => (
                <div
                  key={m.action}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                    m.completed
                      ? 'bg-emerald-50 border border-emerald-100'
                      : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <MissionBadge action={m.action} completed={m.completed} size={32} />
                  <p className={`flex-1 text-xs leading-tight ${m.completed ? 'text-emerald-700 line-through' : 'text-slate-600'}`}>
                    {m.label}
                  </p>
                  <span className={`text-xs font-bold flex-shrink-0 ${m.completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {m.completed ? '✓' : `+${m.points}`}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/ranking"
              className="w-full mt-2 py-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              <IconTrophy size={14} filled /> Ver Ranking Geral
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
