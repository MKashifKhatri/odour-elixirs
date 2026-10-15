import Image from "next/image";
import Link from "next/link";

export default function OdourHero() {
  return (
    <section className="relative overflow-hidden bg-[#211814] px-5 py-12 text-[#fffaf2] sm:px-8 sm:py-20 lg:px-14 lg:py-28">
      <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_78%_20%,#926c4c,transparent_28%),radial-gradient(circle_at_94%_80%,#5c3f2d,transparent_30%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
        <div className="max-w-2xl">
          <Image src="/brand/oe-white.svg" alt="Odour Elixirs" width={255} height={124} className="h-auto w-44 sm:w-52" priority />
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-[#d9c6af]">Fine fragrance, made personal</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.06em] sm:text-7xl">Leave a lasting impression.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#eadfd3] sm:text-lg">Discover scents that settle into your story—created for everyday rituals and unforgettable evenings.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/products" className="rounded-full bg-[#fffaf2] px-6 py-3 text-sm font-semibold text-[#211814] transition hover:bg-[#eadfd3]">Explore fragrances</Link>
            <Link href="/about" className="rounded-full border border-[#fffaf2]/40 px-6 py-3 text-sm font-semibold text-[#fffaf2] transition hover:border-[#fffaf2]">Our story</Link>
          </div>
        </div>
        <div className="rounded-[2rem] border border-[#fffaf2]/15 bg-[#fffaf2]/5 p-7 backdrop-blur-sm sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9c6af]">The Elixirs edit</p>
          <p className="mt-4 font-display text-3xl leading-tight">Fresh beginnings. Warm woods. Deep, memorable trails.</p>
          <p className="mt-5 text-sm leading-6 text-[#eadfd3]">Every fragrance page will show its notes, concentration, longevity, available sizes and current stock.</p>
        </div>
      </div>
    </section>
  );
}
