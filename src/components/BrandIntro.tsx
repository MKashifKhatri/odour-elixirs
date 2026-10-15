"use client";

import { useEffect, useRef, useState } from "react";
import { SITE_NAME } from "@/lib/constants";

export default function BrandIntro({ isInitialHomePage }: { isInitialHomePage: boolean }) {
  const wasInitialHomePage = useRef(isInitialHomePage);
  const [visible, setVisible] = useState(isInitialHomePage);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    if (!wasInitialHomePage.current) return;

    setVisible(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTimer = window.setTimeout(() => setRevealing(true), reducedMotion ? 100 : 2050);
    const removeTimer = window.setTimeout(() => setVisible(false), reducedMotion ? 350 : 3500);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className={`oe-brand-intro${revealing ? " is-revealing" : ""}`} role="status" aria-label={`Welcome to ${SITE_NAME}`}>
      <div className="oe-brand-intro-curtain" />
      <span className="oe-brand-intro-logo" role="img" aria-label={SITE_NAME} />
    </div>
  );
}
