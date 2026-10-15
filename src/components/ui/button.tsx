"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("ds-button", {
  variants: {
    variant: { default: "ds-button-primary", primary: "ds-button-primary", secondary: "ds-button-secondary", outline: "ds-button-secondary", ghost: "ds-button-ghost", link: "ds-button-link", destructive: "ds-button-destructive" },
    size: { default: "ds-button-default", sm: "ds-button-small", lg: "ds-button-large", icon: "ds-button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean; loading?: boolean; loadingLabel?: string; }
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({ className, variant, size, asChild = false, loading = false, loadingLabel = "Loading", disabled, children, onClick, ...props }, ref) {
  const blocked = disabled || loading;
  const content = <>{loading && <span className="ds-spinner" aria-hidden="true" />}{loading ? loadingLabel : children}</>;
  if (asChild) {
    // Slot must receive one element; blocked links retain semantics but cannot navigate.
    const child = React.Children.only(children) as React.ReactElement;
    return <Slot {...props} ref={ref} className={cn(buttonVariants({ variant, size }), className)} aria-disabled={blocked || undefined} aria-busy={loading || undefined} tabIndex={blocked ? -1 : props.tabIndex} onClick={(event) => { if (blocked) { event.preventDefault(); event.stopPropagation(); } else onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>); }}>{React.cloneElement(child, { ...(blocked ? { href: undefined, onClick: (event: React.MouseEvent) => event.preventDefault() } : {}), ...(loading ? { children: <><span className="ds-spinner" aria-hidden="true" />{loadingLabel}</> } : {}) })}</Slot>;
  }
  return <button {...props} ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={blocked} aria-busy={loading || undefined} onClick={onClick}>{content}</button>;
});
export { Button, buttonVariants };
