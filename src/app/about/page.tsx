import type { Metadata } from "next";
import AboutPageContent from "@/components/AboutPageContent";

export const metadata: Metadata = { title: "Our Story", description: "Discover the thinking and craft behind Odour Elixirs fragrances." };

export default function About() {
  return <AboutPageContent />;
}
