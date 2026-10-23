import { createClient } from "@/lib/supabase/server";
import CoverageEditor from "@/components/admin/coverage-editor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCoveragePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("coverage")
    .select("*, tags(id, name)")
    .eq("id", id)
    .single();

  if (!item) notFound();

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .eq("kind", "coverage")
    .order("name");

  return <CoverageEditor item={item} tags={tags ?? []} />;
}
