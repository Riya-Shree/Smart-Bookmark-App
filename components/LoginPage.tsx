"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleGoogleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) {
      console.error("OAuth error:", error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#FAF7F2" }}>
      <header className="px-8 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E2D9" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{ background: "#E85D04" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z" fill="white"/>
            </svg>
          </div>
          <span className="text-xl font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#1C1917" }}>
            Markd
          </span>
        </div>
        <span className="text-xs tracking-widest uppercase" style={{ fontFamily: "'Fira Code', monospace", color: "#78716C" }}>
          v1.0.0
        </span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-lg w-full animate-fade-up">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full text-xs tracking-wider uppercase"
            style={{ fontFamily: "'Fira Code', monospace", background: "rgba(232,93,4,0.08)", color: "#E85D04", border: "1px solid rgba(232,93,4,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 live-pulse inline-block" />
            Real-time · Private · Yours
          </div>

          <h1 className="text-5xl sm:text-6xl font-light leading-[1.05] mb-6"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#1C1917" }}>
            Save what<br />
            <em className="not-italic" style={{ color: "#E85D04" }}>matters.</em>
          </h1>

          <p className="text-lg leading-relaxed mb-10" style={{ color: "#78716C", maxWidth: "380px" }}>
            A minimal bookmark manager that syncs in real-time across all your tabs. No noise. Just your links.
          </p>

          <div className="flex flex-wrap gap-2 mb-10">
            {["Private per account", "Syncs across tabs instantly", "No passwords — Google login"].map((f) => (
              <span key={f} className="px-3 py-1 text-sm rounded-sm"
                style={{ background: "#F0EBE1", color: "#1C1917", border: "1px solid #D6CFC4" }}>
                {f}
              </span>
            ))}
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-ember flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-sm text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Redirecting…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                  <path d="M3.964 10.705A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.037l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.963L3.964 7.295C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <p className="mt-4 text-xs" style={{ fontFamily: "'Fira Code', monospace", color: "#78716C" }}>
            Only your name and email are stored.
          </p>
        </div>
      </main>

      <footer className="px-8 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #E8E2D9" }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "11px", color: "#D6CFC4" }}>
          Next.js · Supabase · Vercel
        </span>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "11px", color: "#D6CFC4" }}>
          © 2026
        </span>
      </footer>
    </div>
  );
}
