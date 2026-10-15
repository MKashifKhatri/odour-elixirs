import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";


import { Category } from "@/lib/types";

export default function Navbar({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden xl:flex items-center w-full">
      <NavigationMenu className="md:right-0 flex-1">
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <Link href="/" passHref legacyBehavior>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)] hover:text-[var(--store-ink)]`}>
                Home
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/products" passHref legacyBehavior>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)] hover:text-[var(--store-ink)]`}>
                Products
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-transparent text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)] hover:text-[var(--store-ink)] focus:bg-[var(--store-accent-soft)] data-[state=open]:bg-[var(--store-accent-soft)]">
              Category
            </NavigationMenuTrigger>
            <NavigationMenuContent className="rounded-xl border border-[var(--store-line)] bg-[var(--store-surface)] text-[var(--store-ink)] shadow-md">
              <ul className="grid w-max grid-cols-2 gap-2 p-2">
                {categories &&
                  categories.map((category: Category, index: number) => (
                    <li key={index}>
                      <Link
                        href={`/category/${category.slug}`}
                        legacyBehavior
                        passHref
                      >
                        <NavigationMenuLink
                          className="block select-none space-y-1 rounded-lg p-3 leading-none no-underline outline-none transition-colors hover:bg-[var(--store-accent-soft)] focus:bg-[var(--store-accent-soft)]"
                        >
                          {category.name}
                        </NavigationMenuLink>
                      </Link>
                    </li>
                  ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/about" passHref legacyBehavior>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)] hover:text-[var(--store-ink)]`}>
                About Us
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/contact" passHref legacyBehavior>
              <NavigationMenuLink className={`${navigationMenuTriggerStyle()} bg-transparent text-[var(--store-ink)] hover:bg-[var(--store-accent-soft)] hover:text-[var(--store-ink)]`}>
                Contact Us
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
