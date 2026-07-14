"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { EmetisIcon } from "@/components/emetis-icon";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type ResetPasswordActionState, resetPassword } from "../actions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<ResetPasswordActionState, FormData>(
    resetPassword,
    { status: "idle" }
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: router is a stable ref
  useEffect(() => {
    if (state.status === "success") {
      setIsSuccessful(true);
      toast({ type: "success", description: "Senha redefinida! Redirecionando..." });
      setTimeout(() => router.push("/login"), 1500);
    } else if (state.status === "expired") {
      toast({ type: "error", description: "Link expirado ou inválido. Solicite um novo." });
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "A senha deve ter pelo menos 6 caracteres." });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Erro ao redefinir senha. Tente novamente." });
    }
  }, [state.status]);

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl">
          ⚠️
        </div>
        <p className="text-sm text-slate-500">Link inválido ou expirado.</p>
        <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 px-4 sm:px-16">
      <input type="hidden" name="token" value={token} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoFocus
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

      <SubmitButton isSuccessful={isSuccessful}>Redefinir senha</SubmitButton>

      <p className="text-center text-sm text-slate-500">
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          ← Voltar para o login
        </Link>
      </p>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-slate-50 to-white pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-8 px-4 pb-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <EmetisIcon size={52} variant="blue" />
          <h1 className="text-2xl font-bold text-slate-800">Criar nova senha</h1>
          <p className="text-sm text-slate-500">
            Escolha uma senha forte com pelo menos 6 caracteres.
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-sm text-slate-400">Carregando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
