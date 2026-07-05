"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useActionState, useEffect, useState } from "react";

import { AuthForm } from "@/components/auth-form";
import { SubmitButton } from "@/components/submit-button";
import { toast } from "@/components/toast";
import { type LoginActionState, login } from "../actions";

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(
    login,
    { status: "idle" }
  );

  const { update: updateSession } = useSession();

  // biome-ignore lint/correctness/useExhaustiveDependencies: router and updateSession are stable refs
  useEffect(() => {
    if (state.status === "failed") {
      toast({ type: "error", description: "E-mail ou senha incorretos." });
    } else if (state.status === "invalid_data") {
      toast({ type: "error", description: "Preencha os campos corretamente." });
    } else if (state.status === "success") {
      setIsSuccessful(true);
      updateSession();
      router.refresh();
    }
  }, [state.status]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex min-h-dvh w-screen items-start justify-center bg-gradient-to-b from-blue-50 to-white pt-12 md:items-center md:pt-0">
      <div className="flex w-full max-w-md flex-col gap-8 overflow-hidden rounded-2xl px-4 pb-10">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl shadow-md">
            🤝
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Entrar no Emetis</h1>
          <p className="text-sm text-slate-500">
            Use seu e-mail e senha para acessar
          </p>
        </div>

        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful}>Entrar</SubmitButton>
          <p className="mt-4 text-center text-sm text-slate-500">
            Não tem uma conta?{" "}
            <Link
              className="font-semibold text-blue-600 hover:underline"
              href="/register"
            >
              Criar conta grátis
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
