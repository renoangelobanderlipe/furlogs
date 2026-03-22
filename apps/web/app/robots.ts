import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/pets/",
          "/settings/",
          "/household/",
          "/vet-visits/",
          "/medications/",
          "/vaccinations/",
          "/reminders/",
          "/stock/",
          "/calendar/",
          "/spending/",
          "/weight-history/",
          "/vet-clinics/",
          "/notifications/",
          "/onboarding/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
