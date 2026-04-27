"use client";

import Link from "next/link";
import {
  BookOpenText,
  BriefcaseBusiness,
  CreditCard,
  FileCheck2,
  Home,
  HardHat,
  LogOut,
  SearchCheck,
  ShieldCheck,
  UserCog,
  UserRoundCheck,
  Users
} from "lucide-react";
import { usePathname } from "next/navigation";

import { signOutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppRole, Profile } from "@/types";

type AppShellProps = {
  profile: Profile;
  applicantNavMode?: "preseminar" | "hasApplication" | "newApplication";
  children: React.ReactNode;
};

const navByRole: Record<AppRole, { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  applicant: [
    { href: "/applicant/seminar", label: "Seminar", icon: BookOpenText },
    { href: "/applicant/applications/new", label: "Information", icon: FileCheck2 },
    { href: "/applicant", label: "Dashboard", icon: Home },
    { href: "/applicant/documents", label: "Documents", icon: ShieldCheck },
    { href: "/applicant/payments", label: "Payments", icon: CreditCard }
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: Home },
    { href: "/admin/seminars", label: "Seminars", icon: BookOpenText },
    { href: "/admin/plumbers", label: "Plumbers", icon: BriefcaseBusiness },
    { href: "/admin/inspectors", label: "Inspectors", icon: HardHat },
    { href: "/admin/access", label: "Access", icon: UserCog },
    { href: "/admin/inspections", label: "Inspections", icon: SearchCheck },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/concessionaires", label: "Concessionaires", icon: UserRoundCheck }
  ],
  inspector: [
    { href: "/inspector", label: "Assignments", icon: Users }
  ]
};

function getApplicantNavItems(mode: "preseminar" | "hasApplication" | "newApplication") {
  if (mode === "preseminar") {
    return [
      { href: "/applicant/seminar", label: "Applicant info", icon: FileCheck2 },
      { href: "/applicant", label: "Dashboard", icon: Home },
      { href: "/applicant/documents", label: "Documents", icon: ShieldCheck },
      { href: "/applicant/payments", label: "Payments", icon: CreditCard }
    ];
  }

  if (mode === "hasApplication") {
    return [
      { href: "/applicant", label: "Applicants", icon: FileCheck2 },
      { href: "/applicant/applications/new", label: "Add applicant", icon: FileCheck2 },
      { href: "/applicant/seminar", label: "Seminar", icon: BookOpenText },
      { href: "/applicant/documents", label: "Documents", icon: ShieldCheck },
      { href: "/applicant/payments", label: "Payments", icon: CreditCard }
    ];
  }

  return navByRole.applicant;
}

export function AppShell({ profile, applicantNavMode = "newApplication", children }: AppShellProps) {
  const pathname = usePathname();
  const navItems =
    profile.role === "applicant"
      ? getApplicantNavItems(applicantNavMode)
      : navByRole[profile.role];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[240px_1fr]">
        <Card className="relative h-fit overflow-hidden border-0 bg-[linear-gradient(180deg,#000000,#1e2c4a)] p-4 text-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#000000,#1e2c4a,#ffa41c,#d9d9d9,#ffffff)]" />
          <div className="mb-6 space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-white/65">BWD Online</p>
            <h1 className="text-lg font-semibold">{profile.full_name}</h1>
            <p className="text-sm capitalize text-white/72">{profile.role}</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== `/${profile.role}` && pathname.startsWith(`${item.href}/`));

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href as never}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-[linear-gradient(135deg,rgba(255,164,28,0.96),rgba(255,143,0,0.92))] font-semibold text-black shadow-[0_12px_24px_-18px_rgba(255,164,28,0.95)]"
                      : "text-white/88 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? "text-black" : "text-white/70"}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <form action={signOutAction} className="mt-6">
            <Button
              type="submit"
              variant="outline"
              className="w-full justify-start gap-2 border-white/20 bg-white/8 text-white hover:bg-white/16"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </Card>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
