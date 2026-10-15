// Retained wrapper API; content is visible immediately without scroll observers.
export default function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <div className={className}>{children}</div>;
}
