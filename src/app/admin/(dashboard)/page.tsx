import { createClient } from "@/lib/supabase/server";
import CarouselAdmin from "@/components/admin/carousel-admin";
import TaglineAdmin from "@/components/admin/tagline-admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [slidesRes, settingsRes] = await Promise.all([
    supabase.from("carousel_slides").select("*").order("position"),
    supabase.from("site_settings").select("tagline").eq("id", 1).single(),
  ]);

  const tagline =
    settingsRes.data?.tagline ??
    "A press agency for artists, productions, and organizations across Broadway and music.";

  return (
    <div className="flex flex-col gap-10">
      <TaglineAdmin initialTagline={tagline} />
      <CarouselAdmin initialSlides={slidesRes.data ?? []} />
    </div>
  );
}
