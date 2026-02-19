import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginPage from "@/components/LoginPage";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware handles redirect but this is a fallback
  if (user) redirect("/bookmarks");

  return <LoginPage />;
}
