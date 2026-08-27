"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, CheckCircle2, ChevronRight } from "lucide-react";

interface InvitePreview {
  code: string;
  type: "church" | "cell" | "community";
  targetId: string;
  targetName: string;
  targetAvatar: string | null;
  targetDescription: string | null;
  targetMemberCount: number | null;
  role: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; gradient: string }> = {
  church:    { label: "Igreja",     icon: "⛪",  gradient: "from-blue-600 to-indigo-700" },
  cell:      { label: "Célula",     icon: "👥",  gradient: "from-indigo-600 to-purple-700" },
  community: { label: "Comunidade", icon: "🏘️", gradient: "from-violet-600 to-purple-700" },
};

const typeRoute: Record<string, string> = {
  church: "/map",
  cell: "/mdc",
  community: "/mdc",
};

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [code, setCode] = useState<string>("");
  const [invite, setInvite] = useState<InvitePreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ code: c }) => setCode(c.toUpperCase()));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated" && code) {
      router.push(`/login?redirect=/join/${code}`);
    }
  }, [status, code, router]);

  useEffect(() => {
    if (!code || status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/invite/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setInvite(data);
      })
      .catch(() => setError("Erro ao carregar convite"))
      .finally(() => setLoading(false));
  }, [code, status]);

  async function handleJoin() {
    if (!invite) return;
    setJoining(true);
    try {
      const res = await fetch(`/api/invite/${code}/use`, { method: "POST" });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setJoined(true);
        setTimeout(() => {
          router.push(typeRoute[invite.type] ?? "/");
        }, 2000);
      }
    } catch {
      setError("Erro ao entrar. Tente novamente.");
    } finally {
      setJoining(false);
    }
  }

  // Loading skeleton
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="h-56 bg-slate-200 animate-pulse rounded-b-3xl" />
        <div className="px-6 -mt-8 flex flex-col gap-3">
          <div className="w-16 h-16 rounded-full bg-slate-200 animate-pulse mx-auto" />
          <div className="h-6 bg-slate-200 animate-pulse rounded-full w-48 mx-auto mt-2" />
          <div className="h-4 bg-slate-100 animate-pulse rounded-full w-64 mx-auto" />
          <div className="h-12 bg-slate-200 animate-pulse rounded-2xl mt-6" />
        </div>
      </div>
    );
  }

  // Success state
  if (joined && invite) {
    const cfg = TYPE_CONFIG[invite.type];
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-br ${cfg.gradient} px-6`}>
        <div className="text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo(a)!</h1>
          <p className="text-white/80 text-base">
            Você entrou em <strong>{invite.targetName}</strong>.
          </p>
          <p className="text-white/60 text-sm mt-1">Redirecionando…</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 gap-5">
        <div className="text-6xl">🔗</div>
        <h1 className="text-xl font-bold text-slate-800">Convite inválido</h1>
        <p className="text-red-500 text-center text-sm">{error}</p>
        <Link
          href="/"
          className="px-6 py-3 bg-slate-800 text-white rounded-2xl text-sm font-semibold"
        >
          Ir para o início
        </Link>
      </div>
    );
  }

  if (!invite) return null;

  const cfg = TYPE_CONFIG[invite.type] ?? { label: invite.type, icon: "🔗", gradient: "from-slate-600 to-slate-800" };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Gradient hero */}
      <div className={`bg-gradient-to-br ${cfg.gradient} pt-12 pb-20 px-6 flex flex-col items-center text-center`}>
        {/* Avatar */}
        {invite.targetAvatar ? (
          <img
            src={invite.targetAvatar}
            alt={invite.targetName}
            className="w-20 h-20 rounded-full object-cover border-4 border-white/30 shadow-xl mb-4"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-xl mb-4">
            {cfg.icon}
          </div>
        )}

        {/* Type label */}
        <span className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">
          Você foi convidado para a {cfg.label}
        </span>

        {/* Name */}
        <h1 className="text-2xl font-bold text-white mb-2 leading-tight">
          {invite.targetName}
        </h1>

        {/* Member count */}
        {invite.targetMemberCount !== null && invite.targetMemberCount > 0 && (
          <div className="flex items-center gap-1.5 text-white/70 text-sm">
            <Users size={14} />
            <span>{invite.targetMemberCount} membro{invite.targetMemberCount !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="flex-1 px-5 -mt-6">
        <div className="bg-white rounded-3xl shadow-xl p-5 space-y-4">
          {/* Description */}
          {invite.targetDescription && (
            <p className="text-sm text-slate-600 leading-relaxed text-center">
              {invite.targetDescription}
            </p>
          )}

          {/* Invite details */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Código</span>
              <span className="font-mono text-slate-800 font-semibold">{invite.code}</span>
            </div>
            {invite.role && invite.role !== 'member' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Papel</span>
                <span className="text-slate-700 font-medium capitalize">{invite.role}</span>
              </div>
            )}
            {invite.expiresAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Expira em</span>
                <span className="text-slate-500 text-xs">{new Date(invite.expiresAt).toLocaleDateString("pt-BR")}</span>
              </div>
            )}
            {invite.maxUses && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Usos</span>
                <span className="text-slate-500 text-xs">{invite.usedCount} / {invite.maxUses}</span>
              </div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleJoin}
            disabled={joining}
            className={`w-full py-4 bg-gradient-to-r ${cfg.gradient} text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-60`}
          >
            {joining ? (
              <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                Entrar em {invite.targetName}
                <ChevronRight size={18} />
              </>
            )}
          </button>

          <Link href="/" className="block text-center text-sm text-slate-400 hover:text-slate-600 py-1">
            Cancelar
          </Link>
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
