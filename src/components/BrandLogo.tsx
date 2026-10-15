import Image from "next/image";

export default function BrandLogo({ priority = false }: { priority?: boolean }) {
  return <Image src="/brand/oe-black.svg" alt="" width={850} height={413} priority={priority} />;
}
