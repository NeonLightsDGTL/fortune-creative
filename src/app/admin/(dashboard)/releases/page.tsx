import { createClient } from "@/lib/supabase/server";
import ReleasesListAdmin from "@/components/admin/releases-list-admin";

export const dynamic = "force-dynamic";

export default async function AdminReleasesPage() {
  const supabase = await createClient();
  const { data: releases } = await supabase
    .from("releases")
    .select("*, tags(name)")
    .order("release_date", { ascending: false });

  return <ReleasesListAdmin key={Date.now()} initialReleases={releases ?? []} />;
}
