import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function listOrganizationsForCurrentUser() {
  const user = await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("memberships")
    .select("role, organization:organizations(id,name,created_at)")
    .eq("user_id", user.id);

  if (error) throw error;
  return data ?? [];
}
