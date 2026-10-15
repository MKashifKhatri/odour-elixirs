"use client";

import { useEffect, useState } from "react";
import { defaultSiteContent, type SiteContent } from "@/lib/siteContent";

export function useStorefrontContent(): SiteContent {
  const [content, setContent] = useState(defaultSiteContent);

  useEffect(() => {
    let active = true;
    fetch("/api/site-content", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (active && data?.content) setContent({ ...defaultSiteContent, ...data.content });
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return content;
}
