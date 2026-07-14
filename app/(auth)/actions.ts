"use server";

import { createHmac } from "crypto";
import { z } from "zod";

import { createUser, getUser, updateUserPassword } from "@/lib/db/queries";
import { generateHashedPassword } from "@/lib/db/utils";

import { signIn } from "./auth";

// ── Token helpers (stateless HMAC, no DB required) ──────────────────────────

function createResetToken(email: string): string {
  const expiry = (Date.now() + 3_600_000).toString(); // 1 hour
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  const sig = createHmac("sha256", secret)
    .update(`${email}|${expiry}`)
    .digest("hex");
  return Buffer.from(`${email}|${expiry}|${sig}`).toString("base64url");
}

function verifyResetToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    // format: email|expiry|sig  (email may contain @, but not |)
    const lastPipe = decoded.lastIndexOf("|");
    const secondPipe = decoded.lastIndexOf("|", lastPipe - 1);
    if (lastPipe < 0 || secondPipe < 0) return null;
    const email = decoded.slice(0, secondPipe);
    const expiry = decoded.slice(secondPipe + 1, lastPipe);
    const sig = decoded.slice(lastPipe + 1);
    if (Date.now() > parseInt(expiry, 10)) return null;
    const secret = process.env.AUTH_SECRET ?? "dev-secret";
    const expected = createHmac("sha256", secret)
      .update(`${email}|${expiry}`)
      .digest("hex");
    return sig === expected ? email : null;
  } catch {
    return null;
  }
}

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  profession: z.string().optional(),
  accountType: z.enum(["individual", "institution"]).default("individual"),
});

export type LoginActionState = {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
};

export const login = async (
  _: LoginActionState,
  formData: FormData
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export type RegisterActionState = {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
};

export const register = async (
  _: RegisterActionState,
  formData: FormData
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      phone: formData.get("phone") || undefined,
      profession: formData.get("profession") || undefined,
      accountType: formData.get("accountType") || "individual",
    });

    const [existingUser] = await getUser(validatedData.email);

    if (existingUser) {
      return { status: "user_exists" } as RegisterActionState;
    }

    await createUser(
      validatedData.email,
      validatedData.password,
      validatedData.name,
      validatedData.phone,
      validatedData.profession,
      validatedData.accountType
    );

    await signIn("credentials", {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: "success" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

// ── Forgot password ──────────────────────────────────────────────────────────

export type ForgotPasswordActionState = {
  status: "idle" | "success" | "failed" | "invalid_data";
};

export const forgotPassword = async (
  _: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> => {
  const email = formData.get("email");
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return { status: "invalid_data" };
  }

  try {
    const users = await getUser(email);
    if (users.length > 0) {
      const token = createResetToken(email);
      const baseUrl =
        process.env.NEXTAUTH_URL ??
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      if (process.env.RESEND_API_KEY) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Emetis <noreply@cliente.veraslog.com.br>",
            to: email,
            subject: "Redefinir sua senha — Emetis",
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto"><h2 style="color:#1e3a5f">Redefinir senha</h2><p>Recebemos uma solicitação para redefinir a senha da sua conta Emetis.</p><p>Clique no botão abaixo. O link expira em <strong>1 hora</strong>.</p><a href="${resetUrl}" style="display:inline-block;margin:16px 0;padding:12px 24px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Redefinir senha</a><p style="color:#64748b;font-size:13px">Se você não solicitou isso, ignore este e-mail.</p></div>`,
          }),
        });
      } else {
        console.log(`[forgot-password] Reset link for ${email}:\n${resetUrl}`);
      }
    }
    return { status: "success" };
  } catch {
    return { status: "failed" };
  }
};

// ── Reset password ───────────────────────────────────────────────────────────

export type ResetPasswordActionState = {
  status: "idle" | "success" | "failed" | "invalid_data" | "expired";
};

export const resetPassword = async (
  _: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> => {
  const token = formData.get("token");
  const password = formData.get("password");

  if (
    !token ||
    typeof token !== "string" ||
    !password ||
    typeof password !== "string" ||
    password.length < 6
  ) {
    return { status: "invalid_data" };
  }

  const email = verifyResetToken(token);
  if (!email) return { status: "expired" };

  try {
    const hashed = generateHashedPassword(password);
    await updateUserPassword(email, hashed);
    return { status: "success" };
  } catch {
    return { status: "failed" };
  }
};
