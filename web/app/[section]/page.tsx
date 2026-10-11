import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { COMING_SOON } from "@/lib/explanations";

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(COMING_SOON).map((section) => ({ section }));
}

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }): Promise<Metadata> {
  const { section } = await params;
  const entry = Object.entries(COMING_SOON).find(([key]) => key === section)?.[1];

  return { title: entry?.title };
}

export default async function ComingSoon({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const entry = Object.entries(COMING_SOON).find(([key]) => key === section)?.[1];

  if (!entry) notFound();

  return (
    <div className="max-w-prose space-y-4">
      <h1 className="text-2xl font-bold">{entry.title}</h1>
      <p className="text-base">{entry.body}</p>
      <p className="text-base">
        Planned for {entry.phase}. Meanwhile, the Overview shows the live storm level, forecast and solar wind.
      </p>
      <Link href="/" className="inline-block font-bold underline">
        Back to Overview
      </Link>
    </div>
  );
}
