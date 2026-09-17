import { notFound } from "next/navigation";
import { SiteRenderer } from "@/renderer/SiteRenderer";
import { getDemoSite, listDemoSiteSlugs } from "@/lib/demo/sites";

interface SitePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return listDemoSiteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: SitePageProps) {
  const { slug } = await params;
  const site = getDemoSite(slug);

  if (!site) {
    return { title: "Site not found" };
  }

  return {
    title: site.config.siteName,
    description: `Published preview of ${site.config.siteName}.`,
  };
}

export default async function SitePage({ params }: SitePageProps) {
  const { slug } = await params;
  const site = getDemoSite(slug);

  if (!site) {
    notFound();
  }

  return <SiteRenderer config={site.config} mediaById={site.mediaById} />;
}
