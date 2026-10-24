import { createClient } from "@/lib/supabase/server";
import CoverageListAdmin from "@/components/admin/coverage-list-admin";

export const dynamic = "force-dynamic";

export default async function AdminCoveragePage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("coverage")
    .select("*, tags(name)")
    .order("published_date", { ascending: false });

  return <CoverageListAdmin key={Date.now()} initialItems={items ?? []} />;
}
