"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface InvitePreview {
  code: string;
  type: "church" | "cell" | "community";
  targetId: string;
  targetName: string;
  targetAvatar: string | null;
  role: string;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
}

const typeLabel: Record<string, string> = {
  church: "Igreja",
  cell: "Célula",
  community: "Comunidade",
};

const typeIcon: Record<string, string> = {
  church: "⛪",
  cell: "👥",
  community: "🏘️",
};

const typeRoute: Record<string, string> = {
  church: "/map",
  cell: "/pib",
  community: "/community",
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

  // Resolver params (Next.js 16 async params)
  useEffect(() => {
    params.then(({ code: c }) => setCode(c.toUpperCase()));
  }, [params]);

  // Redirecionar para login se não autenticado
  useEffect(() => {
    if (status === "unauthenticated" && code) {
      router.push(`/login?redirect=/join/${code}`);
    }
  }, [status, code, router]);

  // Buscar preview do convite
  useEffect(() => {
    if (!code || status !== "authenticated") return;
    setLoading(true);
    fetch(`/api/invite/${code}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data);
        }
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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-slate-50">
        <div className="text-slate-400">Carregando...</div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-slate-50 gap-4 px-6">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-bold text-slate-800">Bem-vindo(a)!</h1>
        <p className="text-slate-500 text-center">
          Você entrou em <strong>{invite?.targetName}</strong>. Redirecionando...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-slate-50 gap-4 px-6">
        <div className="text-5xl">🔗</div>
        <h1 className="text-2xl font-bold text-slate-800">Convite inválido</h1>
        <p className="text-red-500 text-center">{error}</p>
        <Link
          href="/"
          className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium"
        >
          Ir para o início
        </Link>
      </div>
    );
  }

  if (!invite) return null;

  const expiresLabel = invite.expiresAt
    ? `Expira em ${new Date(invite.expiresAt).toLocaleDateString("pt-BR")}`
    : "Sem prazo de expiração";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-6 py-12">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-6">
        {/* Avatar / ícone */}
        {invite.targetAvatar ? (
          <img
            src={invite.targetAvatar}
            alt={invite.targetName}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-100"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-4xl">
            {typeIcon[invite.type]}
          </div>
        )}

        {/* Tipo + nome */}
        <div className="text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            {typeLabel[invite.type]}
          </p>
          <h1 className="text-2xl font-bold text-slate-800">{invite.targetName}</h1>
        </div>

        {/* Detalhes do convite */}
        <div className="w-full bg-slate-50 rounded-xl px-4 py-3 text-sm text-slate-500 space-y-1">
          <p>
            <span className="font-medium text-slate-700">Código:</span>{" "}
            <span className="font-mono">{invite.code}</span>
          </p>
          <p>
            <span className="font-medium text-slate-700">Papel:</span>{" "}
            {invite.role}
          </p>
          <p className="text-xs text-slate-400">{expiresLabel}</p>
        </div>

        {/* CTA */}
        <button
          onClick={handleJoin}
          disabled={joining}
          className="w-full py-3 bg-slate-800 text-white rounded-xl font-semibold text-base hover:bg-slate-700 active:bg-slate-900 transition disabled:opacity-50"
        >
          {joining ? "Entrando..." : `Entrar em ${invite.targetName}`}
        </button>

        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
          Cancelar
        </Link>
      </div>
    </div>
  );
}
