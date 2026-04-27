"use client";

import dynamic from "next/dynamic";

const RegisterForm = dynamic(
  () => import("@/components/auth/register-form").then((module) => module.RegisterForm),
  { ssr: false }
);

export function RegisterPageShell() {
  return <RegisterForm />;
}
