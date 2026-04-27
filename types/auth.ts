import type { AppRole, Profile } from "@/types/domain";

export type SessionUser = {
  id: string;
  email: string;
};

export type AuthenticatedProfile = Profile & {
  role: AppRole;
};
