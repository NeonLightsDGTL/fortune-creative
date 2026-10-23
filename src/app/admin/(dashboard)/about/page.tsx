import { createClient } from "@/lib/supabase/server";
import AboutAdmin from "@/components/admin/about-admin";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase
    .from("about")
    .select("*")
    .eq("id", 1)
    .single();

  return (
    <AboutAdmin
      initialPhotoPath={about?.photo_path ?? null}
      initialCredit={about?.photo_credit ?? ""}
      initialBio={about?.bio ?? ""}
    />
  );
}
