import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://fortunecreative.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/clients`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/releases`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/coverage`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const supabase = await createClient();
  const { data: releases } = await supabase
    .from("releases")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("release_date", { ascending: false });

  const releaseRoutes: MetadataRoute.Sitemap = (releases ?? []).map((r) => ({
    url: `${baseUrl}/releases/${r.slug}`,
    lastModified: r.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...releaseRoutes];
}
