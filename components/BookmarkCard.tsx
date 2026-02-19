"use client";

import { useState } from "react";
import type { Bookmark } from "./BookmarksPage";

type Props = {
  bookmark: Bookmark;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  animationDelay: number;
};

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFaviconSrc(url: string): string {
  try {
    const origin = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain=${origin}&sz=32`;
  } catch {
    return "";
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function BookmarkCard({
  bookmark,
  onDelete,
  isDeleting,
  animationDelay,
}: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const domain = getDomain(bookmark.url);
  const faviconSrc = getFaviconSrc(bookmark.url);
  const firstLetter = domain[0]?.toUpperCase() ?? "?";

  function handleDeleteClick() {
    if (confirmDelete) {
      onDelete(bookmark.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      // Auto-cancel confirm after 3s
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  }

  return (
    <div
      className="bookmark-row flex items-center gap-3 px-4 py-3.5 animate-fade-up"
      style={{
        borderBottom: "1px solid #E8E2D9",
        opacity: isDeleting ? 0.4 : 1,
        transition: "opacity 0.2s ease",
        animationDelay: `${animationDelay}ms`,
        animationFillMode: "both",
      }}
    >
      {/* Favicon */}
      <div
        className="flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center overflow-hidden"
        style={{ background: "#F0EBE1" }}
      >
        {faviconSrc && !faviconFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faviconSrc}
            alt=""
            width={16}
            height={16}
            className="w-4 h-4 object-contain"
            onError={() => setFaviconFailed(true)}
          />
        ) : (
          <span
            className="text-xs font-bold"
            style={{ color: "#78716C", fontFamily: "'Fira Code', monospace" }}
          >
            {firstLetter}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm font-medium truncate hover:underline"
          style={{
            color: "#1C1917",
            textDecorationColor: "#E85D04",
            textUnderlineOffset: "3px",
          }}
        >
          {bookmark.title}
        </a>
        <div className="flex items-center gap-2 mt-0.5">
          <span
            className="text-xs truncate"
            style={{ fontFamily: "'Fira Code', monospace", color: "#78716C", fontSize: "11px" }}
          >
            {domain}
          </span>
          <span style={{ color: "#D6CFC4", fontSize: "10px" }}>·</span>
          <span
            className="text-xs flex-shrink-0"
            style={{ fontFamily: "'Fira Code', monospace", color: "#D6CFC4", fontSize: "11px" }}
          >
            {formatDate(bookmark.created_at)}
          </span>
        </div>
      </div>

      {/* Actions — visible on hover (CSS group) */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Visit link */}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Open link"
          className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-xs transition-colors"
          style={{
            fontFamily: "'Fira Code', monospace",
            color: "#78716C",
            border: "1px solid transparent",
            textDecoration: "none",
            fontSize: "11px",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#D6CFC4";
            (e.currentTarget as HTMLElement).style.color = "#1C1917";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#78716C";
          }}
        >
          Open ↗
        </a>

        {/* Delete */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          title={confirmDelete ? "Click again to confirm" : "Delete bookmark"}
          className="px-2.5 py-1 rounded-sm text-xs transition-all"
          style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: "11px",
            color: confirmDelete ? "#E85D04" : "#78716C",
            border: confirmDelete ? "1px solid rgba(232,93,4,0.4)" : "1px solid transparent",
            background: confirmDelete ? "rgba(232,93,4,0.06)" : "transparent",
            cursor: isDeleting ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => {
            if (!confirmDelete) {
              (e.currentTarget as HTMLElement).style.borderColor = "#D6CFC4";
              (e.currentTarget as HTMLElement).style.color = "#dc2626";
            }
          }}
          onMouseLeave={(e) => {
            if (!confirmDelete) {
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#78716C";
            }
          }}
        >
          {isDeleting ? "…" : confirmDelete ? "Confirm?" : "Delete"}
        </button>
      </div>
    </div>
  );
}
