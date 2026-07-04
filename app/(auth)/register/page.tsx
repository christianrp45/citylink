"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "user_exists") {
      toast({ type: "error", description: "Esse e-mail já está cadastrado!" });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Erro ao criar conta. Tente novamente." });
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "Preencha todos os campos corretamente." });
    } else if (state.status === "success") {
      toast({ type: "success", description: "Conta criada com sucesso!" });
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  return (
    <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-blue-50 to-white pt-10 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-8 overflow-hidden rounded-2xl px-4 pb-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-md">
            🤝
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
          <p className="text-sm text-slate-500">
            Entre para a comunidade CityLink
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-4">
          {/* Nome completo */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-700"
            >
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder="Ex: João Silva"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-700"
            >
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Profissão */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="profession"
              className="text-sm font-medium text-slate-700"
            >
              Profissão{" "}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="profession"
              name="profession"
              type="text"
              placeholder="Ex: Eletricista, Designer, Pastor..."
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="phone"
              className="text-sm font-medium text-slate-700"
            >
              Telefone / WhatsApp{" "}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <SubmitButton isSuccessful={isSuccessful}>
            Criar conta
          </SubmitButton>

          <p className="text-center text-sm text-slate-500">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
