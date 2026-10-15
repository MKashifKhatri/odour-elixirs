import type { Metadata } from "next";
import StyleGuide from "@/components/StyleGuide";

export const metadata: Metadata = { title: "Component style guide", robots: { index: false, follow: false } };
export default function StyleGuidePage() { return <StyleGuide />; }
