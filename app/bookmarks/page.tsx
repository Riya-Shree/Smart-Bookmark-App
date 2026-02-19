import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BookmarksPage from "@/components/BookmarksPage";

export const dynamic = "force-dynamic"; // Always SSR — no caching for user data

export default async function Bookmarks() {
  const supabase = await createClient();

  // getUser() makes a network request to Supabase to verify the JWT
  // This is intentional — we never trust stale session data for protected routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  // Server-side fetch for initial render — no loading state on first paint
  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id, url, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookmarks:", error.message);
  }

  return (
    <BookmarksPage
      initialBookmarks={bookmarks ?? []}
      user={{
        id: user.id,
        email: user.email ?? "",
        name: user.user_metadata?.full_name ?? user.email ?? "User",
        avatarUrl: user.user_metadata?.avatar_url ?? null,
      }}
    />
  );
}
