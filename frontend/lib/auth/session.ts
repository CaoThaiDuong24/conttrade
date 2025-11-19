"use client";

import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  user: { id: string; email: string; role: string } | null;
  setSession: (token: string | null, user: AuthState["user"]) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: (token, user) => set({ accessToken: token, user }),
  clear: () => set({ accessToken: null, user: null }),
}));

export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}


