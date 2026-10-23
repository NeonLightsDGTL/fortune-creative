import { createClient } from "@/lib/supabase/server";
import ClientsAdmin from "@/components/admin/clients-admin";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .order("position");

  return <ClientsAdmin initialClients={clients ?? []} />;
}
