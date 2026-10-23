import AdminSidebar from "@/components/admin/admin-sidebar";
import AdminMobileHeader from "@/components/admin/admin-mobile-header";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-admin-bg text-ink font-sans">
      <AdminMobileHeader />
      <div className="flex flex-wrap md:flex-nowrap">
        <AdminSidebar />
        <main className="flex-[999_1_640px] min-w-0 box-border p-10 pb-16 max-md:p-5 max-md:pb-10">
          {children}
        </main>
      </div>
    </div>
  );
}
