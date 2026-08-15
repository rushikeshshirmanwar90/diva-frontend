"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Renders Google's own "Sign in with Google" button rather than a look-alike
 * triggered by a hidden one.
 *
 * A custom-styled button that forwards its click to a hidden GIS button is a
 * common trick, but it depends on GIS's internal DOM shape and breaks
 * silently when Google changes it. Rendering the real button costs some
 * pixel-perfect control over styling; it does not cost a working sign-in flow
 * six months from now.
 */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

type CredentialResponse = { credential: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: CredentialResponse) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

export function GoogleSignInButton({
  onCredential,
  disabled,
}: {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  const handleCredential = useCallback(
    (response: CredentialResponse) => onCredential(response.credential),
    [onCredential],
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !scriptReady || !containerRef.current || !window.google) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });

    // Re-rendered on every effect run rather than once, so a `disabled` flip
    // (say, while a password login is in flight) is reflected without a
    // second script load.
    containerRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(containerRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      shape: "rectangular",
      text: "continue_with",
      logo_alignment: "left",
      width: 336,
    });
  }, [scriptReady, handleCredential]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        title="Google sign-in is not configured — set NEXT_PUBLIC_GOOGLE_CLIENT_ID"
        className="mt-6 flex w-full items-center justify-center border border-line py-3.5 text-[11px] tracking-luxe uppercase text-muted opacity-60"
      >
        Google sign-in unavailable
      </button>
    );
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
      />
      <div
        ref={containerRef}
        className={disabled ? "mt-6 flex justify-center pointer-events-none opacity-50" : "mt-6 flex justify-center"}
      />
    </>
  );
}
