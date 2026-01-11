"use client";

import Script from "next/script";

export function Analytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

  if (!websiteId) {
    console.warn("Umami website ID not configured");
    return null;
  }

  return (
    <Script
      src="/stats/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  );
}
