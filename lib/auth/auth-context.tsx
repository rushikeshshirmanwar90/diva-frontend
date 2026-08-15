"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as authApi from "@/lib/api/auth";
import type { Profile, RegisterInput, UpdateProfileInput } from "@/lib/api/auth";

/**
 * Session state for the storefront.
 *
 * There is no token anywhere in this file — the session lives in an httpOnly
 * cookie the browser cannot read, so the only way to know "am I signed in" is
 * to ask the backend. `status` starts at `"loading"` rather than defaulting to
 * `"guest"` so a page does not flash a sign-in prompt for the instant before
 * that first `/auth/me` call resolves.
 */

type AuthStatus = "loading" | "authenticated" | "guest";

type AuthValue = {
  status: AuthStatus;
  user: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ email: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<Profile | null>(null);

  const hydrate = useCallback(async () => {
    try {
      const profile = await authApi.getMe();
      setUser(profile);
      setStatus("authenticated");
    } catch {
      // A 401 here just means signed out — not a fault worth surfacing.
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const profile = await authApi.getMe();
        if (cancelled) return;
        setUser(profile);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setUser(null);
        setStatus("guest");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * `login`/`register`/etc. re-fetch the profile after the mutation rather
   * than trusting the mutation's own response shape, so `user` in context is
   * always the full `Profile` regardless of which endpoint established the
   * session — one shape for every consumer instead of a union.
   */
  const login = useCallback(async (email: string, password: string) => {
    await authApi.login({ email, password });
    await hydrate();
  }, [hydrate]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    await authApi.loginWithGoogle(idToken);
    await hydrate();
  }, [hydrate]);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await authApi.register(input);
    return { email: result.email };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    await authApi.verifyOtp(email, otp);
    await hydrate();
  }, [hydrate]);

  const resendOtp = useCallback(async (email: string) => {
    await authApi.resendOtp(email);
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const profile = await authApi.updateProfile(input);
    setUser(profile);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      // Cleared locally even if the request failed — an unreachable backend
      // should not leave the UI insisting someone is still signed in.
      setUser(null);
      setStatus("guest");
    }
  }, []);

  const value: AuthValue = {
    status,
    user,
    login,
    loginWithGoogle,
    register,
    verifyOtp,
    resendOtp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
