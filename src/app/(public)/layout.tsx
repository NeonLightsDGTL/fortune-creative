import SiteHeader from "@/components/site-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader turnstileSiteKey={process.env.TURNSTILE_SITE_KEY} />
      <main>{children}</main>
    </>
  );
}
