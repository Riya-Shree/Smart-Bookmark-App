"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkCard from "./BookmarkCard";

export type Bookmark = {
  id: string;
  url: string;
  title: string;
  created_at: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

type Props = {
  initialBookmarks: Bookmark[];
  user: User;
};

export default function BookmarksPage({ initialBookmarks, user }: Props) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [isConnected, setIsConnected] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [signOutLoading, setSignOutLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  // Debug on mount
  useEffect(() => {
    console.log('🚀 Component mounted');
    console.log('📊 Initial bookmarks:', bookmarks.length);
    console.log('👤 User:', user.id);
    console.log('🔑 Env check:', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    });
  }, []);

  // Realtime subscription
  useEffect(() => {
    console.log('🔌 Setting up realtime...');
    
    const channel = supabase
      .channel(`bookmarks-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('📡 REALTIME EVENT!', payload.eventType, payload);
          
          if (payload.eventType === "INSERT") {
            console.log('➕ INSERT');
            setBookmarks((prev) => {
              const exists = prev.find((b) => b.id === (payload.new as Bookmark).id);
              if (exists) {
                console.log('⚠️ Duplicate, skipping');
                return prev;
              }
              console.log('✅ Adding to state');
              return [payload.new as Bookmark, ...prev];
            });
          } else if (payload.eventType === "DELETE") {
            console.log('🗑️ DELETE');
            setBookmarks((prev) => prev.filter((b) => b.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            console.log('🔄 UPDATE');
            setBookmarks((prev) =>
              prev.map((b) =>
                b.id === (payload.new as Bookmark).id ? (payload.new as Bookmark) : b
              )
            );
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📊 Subscription status:', status);
        if (err) console.error('❌ Sub error:', err);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      console.log('🔌 Cleanup');
      supabase.removeChannel(channel);
    };
  }, [user.id, supabase]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this bookmark?')) return;
    
    console.log('🗑️ Deleting:', id);
    setDeletingId(id);
    
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    setDeletingId(null);

    if (error) {
      console.error('❌ Delete error:', error);
      alert('Delete failed');
    } else {
      console.log('✅ Deleted');
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const filtered = search
    ? bookmarks.filter(
        (b) =>
          b.title.toLowerCase().includes(search.toLowerCase()) ||
          b.url.toLowerCase().includes(search.toLowerCase())
      )
    : bookmarks;

  const initials = user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: "#FAF7F2" }}>
      <header
        className="sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between"
        style={{
          background: "rgba(250,247,242,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #E8E2D9",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: "#E85D04" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z" fill="white"/>
              </svg>
            </div>
            <span className="text-base font-semibold tracking-tight" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Markd
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-colors duration-500"
            style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: "11px",
              background: isConnected ? "rgba(34,197,94,0.08)" : "rgba(120,113,108,0.08)",
              color: isConnected ? "#16a34a" : "#78716C",
              border: `1px solid ${isConnected ? "rgba(34,197,94,0.25)" : "rgba(120,113,108,0.2)"}`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: isConnected ? "#22c55e" : "#78716C",
                animation: isConnected ? "live-pulse 2s ease-in-out infinite" : "none",
              }}
            />
            {isConnected ? "live" : "connecting…"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              referrerPolicy="no-referrer"
              alt={user.name}
              width={28}
              height={28}
              className="rounded-full"
              style={{ border: "1px solid #D6CFC4" }}
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "#1C1917", color: "#FAF7F2", fontFamily: "'Fira Code', monospace" }}
            >
              {initials}
            </div>
          )}
          <span className="text-sm hidden sm:block" style={{ color: "#78716C" }}>
            {user.name.split(" ")[0]}
          </span>
          <button
            onClick={handleSignOut}
            disabled={signOutLoading}
            className="text-xs px-3 py-1.5 rounded-sm transition-colors"
            style={{
              fontFamily: "'Fira Code', monospace",
              color: "#78716C",
              border: "1px solid #D6CFC4",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {signOutLoading ? "…" : "Sign out"}
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-8 animate-fade-up">
          <div>
            <h1
              className="text-3xl font-medium leading-tight"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#1C1917" }}
            >
              Your Bookmarks
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#78716C" }}>
              {bookmarks.length === 0 ? "Nothing saved yet" : `${bookmarks.length} saved link${bookmarks.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="btn-ember flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium"
          >
            <span className="text-lg leading-none">{showAddForm ? "×" : "+"}</span>
            {showAddForm ? "Cancel" : "Add bookmark"}
          </button>
        </div>

        {showAddForm && (
          <div
            className="mb-6 p-5 rounded-sm border animate-slide-in"
            style={{ background: "#F0EBE1", border: "1px solid #D6CFC4" }}
          >
            <AddBookmarkForm userId={user.id} onSuccess={() => setShowAddForm(false)} />
          </div>
        )}

        {bookmarks.length > 3 && (
          <div className="mb-5 animate-fade-up delay-75">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles and URLs…"
              className="w-full px-4 py-2.5 text-sm rounded-sm"
              style={{
                background: "white",
                border: "1px solid #D6CFC4",
                color: "#1C1917",
                outline: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="text-5xl mb-4 opacity-20">🔖</div>
            <p
              className="text-lg font-medium mb-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "#1C1917" }}
            >
              {search ? "No results found" : "Your collection is empty"}
            </p>
            <p className="text-sm" style={{ color: "#78716C" }}>
              {search ? `No bookmarks match "${search}"` : "Hit «Add bookmark» to save your first link"}
            </p>
          </div>
        ) : (
          <div className="rounded-sm overflow-hidden" style={{ border: "1px solid #D6CFC4" }}>
            {filtered.map((bookmark, i) => (
              <BookmarkCard
                key={bookmark.id}
                bookmark={bookmark}
                onDelete={handleDelete}
                isDeleting={deletingId === bookmark.id}
                animationDelay={i * 40}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #E8E2D9" }}>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "11px", color: "#D6CFC4" }}>
          {isConnected ? "↻ synced live" : "reconnecting…"}
        </span>
        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: "11px", color: "#D6CFC4" }}>
          Built with Next.js + Supabase
        </span>
      </footer>
    </div>
  );
}

