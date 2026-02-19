"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useRef } from "react";

type Props = {
  userId: string;
  onSuccess: () => void;
};

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return "https://" + trimmed;
  }
  return trimmed;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default function AddBookmarkForm({ userId, onSuccess }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const urlRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  
  console.log('🚀 Starting bookmark save...');

  const normalizedUrl = normalizeUrl(url);
  console.log('📍 URL normalized:', normalizedUrl);

  if (!normalizedUrl) {
    setError("URL is required");
    urlRef.current?.focus();
    return;
  }

  if (!isValidUrl(normalizedUrl)) {
    setError("That doesn't look like a valid URL. Try including the domain (e.g. example.com)");
    urlRef.current?.focus();
    return;
  }

  const finalTitle = title.trim() || new URL(normalizedUrl).hostname;
  console.log('📝 Final title:', finalTitle);
  console.log('👤 User ID:', userId);

  const bookmarkData = {
    user_id: userId,
    url: normalizedUrl,
    title: finalTitle,
  };
  
  console.log('💾 Attempting to insert:', bookmarkData);
  setSaving(true);
  
  const { data, error: dbError } = await supabase
    .from("bookmarks")
    .insert(bookmarkData)
    .select(); // Add .select() to get the inserted row back
  
  console.log('✅ Insert response data:', data);
  console.log('❌ Insert error:', dbError);
  
  setSaving(false);

  if (dbError) {
    console.error('❌ Database error:', dbError);
    setError(dbError.message);
    return;
  }

  console.log('🎉 Bookmark saved successfully!');
  setUrl("");
  setTitle("");
  onSuccess();
}




  const fieldStyle = {
    background: "white",
    border: "1px solid #D6CFC4",
    color: "#1C1917",
    fontFamily: "'DM Sans', sans-serif",
    borderRadius: "2px",
    fontSize: "14px",
    padding: "10px 12px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3
        className="text-sm font-semibold mb-4"
        style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#1C1917" }}
      >
        Add a new bookmark
      </h3>

      <div className="space-y-3">
        {/* URL */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'Fira Code', monospace", color: "#78716C" }}
          >
            URL *
          </label>
          <input
            ref={urlRef}
            type="text"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            placeholder="https://example.com"
            style={fieldStyle}
            onFocus={(e) => (e.target.style.borderColor = "#E85D04")}
            onBlur={(e) => (e.target.style.borderColor = "#D6CFC4")}
            autoFocus
            required
          />
        </div>

        {/* Title */}
        <div>
          <label
            className="block text-xs font-medium mb-1.5 uppercase tracking-wider"
            style={{ fontFamily: "'Fira Code', monospace", color: "#78716C" }}
          >
            Title{" "}
            <span style={{ color: "#D6CFC4", textTransform: "none", letterSpacing: 0 }}>
              (optional — defaults to domain)
            </span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My favourite article…"
            style={fieldStyle}
            onFocus={(e) => (e.target.style.borderColor = "#E85D04")}
            onBlur={(e) => (e.target.style.borderColor = "#D6CFC4")}
          />
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-xs px-3 py-2.5 rounded-sm"
            style={{
              fontFamily: "'Fira Code', monospace",
              color: "#E85D04",
              background: "rgba(232,93,4,0.08)",
              border: "1px solid rgba(232,93,4,0.25)",
            }}
          >
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={saving}
            className="btn-ember flex items-center gap-2 px-5 py-2.5 rounded-sm text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 016 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Saving…
              </>
            ) : (
              "Save bookmark"
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
