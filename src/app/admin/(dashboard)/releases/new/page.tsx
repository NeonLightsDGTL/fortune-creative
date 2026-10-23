import { createClient } from "@/lib/supabase/server";
import ReleaseEditor from "@/components/admin/release-editor";

export const dynamic = "force-dynamic";

export default async function NewReleasePage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .eq("kind", "release")
    .order("name");

  return <ReleaseEditor tags={tags ?? []} />;
}
