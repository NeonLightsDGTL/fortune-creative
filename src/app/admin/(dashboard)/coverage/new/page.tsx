import { createClient } from "@/lib/supabase/server";
import CoverageEditor from "@/components/admin/coverage-editor";

export const dynamic = "force-dynamic";

export default async function NewCoveragePage() {
  const supabase = await createClient();
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .eq("kind", "coverage")
    .order("name");

  return <CoverageEditor tags={tags ?? []} />;
}
