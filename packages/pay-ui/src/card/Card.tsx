import type { HTMLAttributes } from "react";
import { cn } from "../lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-white bg-[#FDFDFD] p-4 shadow-[0_0_20px_0_rgba(0,0,0,0.06)] md:rounded-[20px] md:p-5",
        className,
      )}
      {...props}
    />
  );
}

export default Card;
