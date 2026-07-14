"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmetisIcon } from "@/components/emetis-icon";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type RegisterActionState, register } from "../actions";

export default function Page() {
  const router = useRouter();
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [accountType, setAccountType] = useState<"individual" | "institution">("individual");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-slate-50 to-white pt-10 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-6 overflow-hidden rounded-2xl px-4 pb-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <EmetisIcon size={52} variant="blue" />
          <h1 className="text-2xl font-bold text-slate-800">Criar conta</h1>
          <p className="text-sm text-slate-500">
            Entre para a comunidade Emetis
          </p>
        </div>

        {/* Seletor de tipo de conta */}
        <div className="flex flex-col gap-1.5">
          <p className="text-sm font-medium text-slate-700">Tipo de conta</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAccountType("individual")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                accountType === "individual"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">👤</span>
              Pessoa
              <span className="text-[10px] font-normal text-slate-400">Membro, cristão</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("institution")}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors ${
                accountType === "institution"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
              }`}
            >
              <span className="text-xl">🏛️</span>
              Instituição
              <span className="text-[10px] font-normal text-slate-400">Igreja, ministério</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-4">
          {/* Campo oculto com tipo de conta */}
          <input type="hidden" name="accountType" value={accountType} />

          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-slate-700">
              {accountType === "institution" ? "Nome da instituição" : "Nome completo"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoFocus
              placeholder={accountType === "institution" ? "Ex: Igreja Batista Central" : "Ex: João Silva"}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
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
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Senha <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Profissão (só para pessoa) */}
          {accountType === "individual" && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="profession" className="text-sm font-medium text-slate-700">
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
          )}

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate-700">
              {accountType === "institution" ? "Telefone de contato" : "Telefone / WhatsApp"}{" "}
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
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
