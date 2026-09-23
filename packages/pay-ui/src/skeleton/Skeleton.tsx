import { cn } from "../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-pulse rounded-[8px] bg-[#e8e8e8]", className)} />;
}

export default Skeleton;
