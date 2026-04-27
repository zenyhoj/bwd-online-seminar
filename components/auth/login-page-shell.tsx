"use client";

import dynamic from "next/dynamic";

const LoginForm = dynamic(
  () => import("@/components/auth/login-form").then((module) => module.LoginForm),
  { ssr: false }
);

export function LoginPageShell() {
  return <LoginForm />;
}
