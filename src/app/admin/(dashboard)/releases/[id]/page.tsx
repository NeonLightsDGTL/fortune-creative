import { createClient } from "@/lib/supabase/server";
import ReleaseEditor from "@/components/admin/release-editor";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: release } = await supabase
    .from("releases")
    .select("*, tags(id, name)")
    .eq("id", id)
    .single();

  if (!release) notFound();

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name")
    .eq("kind", "release")
    .order("name");

  return <ReleaseEditor release={release} tags={tags ?? []} />;
}
