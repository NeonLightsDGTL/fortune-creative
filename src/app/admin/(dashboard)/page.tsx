import { createClient } from "@/lib/supabase/server";
import CarouselAdmin from "@/components/admin/carousel-admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const { data: slides } = await supabase
    .from("carousel_slides")
    .select("*")
    .order("position");

  return <CarouselAdmin initialSlides={slides ?? []} />;
}
