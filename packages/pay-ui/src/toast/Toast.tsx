import type { ReactNode } from "react";
import { IconAlert } from "../icons/alert";
import { IconCheck } from "../icons/check";
import { IconClose } from "../icons/close";
import { IconLoading } from "../icons/loading";
import { cn } from "../lib/cn";
import { fontSans } from "../lib/font";

export const ToastType = {
  Success: "success",
  Error: "error",
  Info: "info",
  Pending: "pending",
  Notice: "notice",
} as const;
export type ToastType = (typeof ToastType)[keyof typeof ToastType];

export type ToastProps = {
  type: ToastType;
  title: ReactNode;
  text?: ReactNode;
  className?: string;
  closeToast?: () => void;
};

const badgeClassName: Record<ToastType, string> = {
  [ToastType.Success]: "bg-[#84a20f]",
  [ToastType.Error]: "bg-[#ff5656]",
  [ToastType.Info]: "bg-[#007AFF]",
  [ToastType.Pending]: "bg-[#FF9500]",
  [ToastType.Notice]: "bg-[#606060]",
};

export function Toast(props: ToastProps) {
  const { type, title, text, className, closeToast } = props;

  return (
    <div
      className={cn(
        "w-[316px] rounded-xl border border-[#e0e0e0] bg-[#fdfdfd] px-3 py-3.5 shadow-[0_0_20px_0_rgba(0,0,0,0.06)] max-md:w-[calc(100vw-32px)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={cn("flex min-w-0 items-start gap-1.5 text-sm font-semibold leading-normal text-black", fontSans)}>
          <div
            className={cn(
              "flex size-3.5 shrink-0 translate-y-1 items-center justify-center rounded-full text-white",
              badgeClassName[type],
            )}
          >
            {type === ToastType.Success ? <IconCheck className="size-1.5 shrink-0" /> : null}
            {type === ToastType.Error ? <IconClose className="size-1.5 shrink-0" /> : null}
            {type === ToastType.Info || type === ToastType.Notice ? <IconAlert className="size-1.5 shrink-0" /> : null}
            {type === ToastType.Pending ? <IconLoading className="size-2 shrink-0 animate-spin" /> : null}
          </div>
          <div>{title}</div>
        </div>
        <button
          type="button"
          className="mt-0 shrink-0 cursor-pointer border-0 bg-transparent p-0 text-black"
          onClick={closeToast}
          aria-label="Close"
        >
          <IconClose className="size-2" />
        </button>
      </div>
      {text ? (
        <div className={cn("mt-2.5 flex items-center gap-1 text-xs font-medium leading-normal text-[#606060]", fontSans)}>
          <div className="min-w-0 flex-1">{text}</div>
        </div>
      ) : null}
    </div>
  );
}

export default Toast;
