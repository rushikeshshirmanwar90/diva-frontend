import { apiFetch } from "@/lib/api/client";

/**
 * Auth calls. Every mutation here rides on the same httpOnly-cookie session
 * `apiFetch` already assumes — nothing in this module ever sees a token, only
 * the user object the backend hands back after setting the cookie.
 *
 * Hand-written against diva-backend's Zod validators in `validators/auth.ts`,
 * same caveat as `lib/api/checkout.ts`: replace with generated types once
 * `npm run sync:types` covers auth.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatarUrl?: string;
};

export type Profile = SessionUser & {
  phone?: string;
  marketingOptIn: boolean;
  createdAt: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  marketingOptIn?: boolean;
};

/** Registration never logs anyone in directly — the OTP step does. */
export type RegisterResult = { requiresVerification: true; email: string };

export type LoginInput = { email: string; password: string };

export type UpdateProfileInput = {
  name?: string;
  phone?: string;
  marketingOptIn?: boolean;
};

// ---------------------------------------------------------------------------
// Calls
// ---------------------------------------------------------------------------

export function register(input: RegisterInput) {
  return apiFetch<RegisterResult>("/auth/register", { method: "POST", body: input });
}

export function verifyOtp(email: string, otp: string) {
  return apiFetch<{ user: SessionUser }>("/auth/verify-otp", {
    method: "POST",
    body: { email, otp },
  });
}

export function resendOtp(email: string) {
  return apiFetch<{ sent: true }>("/auth/resend-otp", { method: "POST", body: { email } });
}

export function login(input: LoginInput) {
  return apiFetch<{ user: SessionUser }>("/auth/login", {
    method: "POST",
    body: { ...input, audience: "storefront" },
  });
}

/** `idToken` is the credential Google Identity Services hands the browser. */
export function loginWithGoogle(idToken: string) {
  return apiFetch<{ user: SessionUser }>("/auth/google", {
    method: "POST",
    body: { idToken, audience: "storefront" },
  });
}

export function logout() {
  return apiFetch<{ loggedOut: true }>("/auth/logout", { method: "POST" });
}

/**
 * Whoami. Called once on load to hydrate the session from the cookie — a 401
 * here just means "signed out", not a fault, so callers should catch it
 * rather than surface it as an error.
 */
export function getMe() {
  return apiFetch<Profile>("/auth/me");
}

export function updateProfile(input: UpdateProfileInput) {
  return apiFetch<Profile>("/auth/me", { method: "PATCH", body: input });
}
