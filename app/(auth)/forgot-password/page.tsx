"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { EmetisIcon } from "@/components/emetis-icon";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type ForgotPasswordActionState, forgotPassword } from "../actions";

export default function ForgotPasswordPage() {
  const [state, formAction] = useActionState<ForgotPasswordActionState, FormData>(
    forgotPassword,
    { status: "idle" }
  );

  useEffect(() => {
    if (state.status === "invalid_data") {
      toast({ type: "error", description: "Informe um e-mail válido." });
    } else if (state.status === "failed") {
      toast({ type: "error", description: "Erro ao processar. Tente novamente." });
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-slate-50 to-white pt-12 md:items-center md:pt-0">
        <div className="flex w-full max-w-md flex-col items-center gap-6 px-4 pb-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">
            ✉️
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Verifique seu e-mail</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em
            instantes. Verifique também a caixa de spam.
          </p>
          <Link
            href="/login"
            className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Voltar para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-slate-50 to-white pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-8 px-4 pb-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <EmetisIcon size={52} variant="blue" />
          <h1 className="text-2xl font-bold text-slate-800">Esqueci minha senha</h1>
          <p className="text-sm text-slate-500">
            Informe seu e-mail e enviaremos um link para criar uma nova senha.
          </p>
        </div>

        <form action={formAction} className="flex flex-col gap-4 px-4 sm:px-16">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Seu e-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              placeholder="voce@exemplo.com"
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <SubmitButton isSuccessful={false}>Enviar link de redefinição</SubmitButton>

          <p className="text-center text-sm text-slate-500">
            Lembrou a senha?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
