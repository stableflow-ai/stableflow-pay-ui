import type { ReactNode } from "react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { IconChevron } from "@stableflow/pay-ui/icons/outline/chevron";
import { IconClose } from "@stableflow/pay-ui/icons/outline/close";
import { cx } from "../token-select/format";
import { useDesktop } from "../token-select/use-desktop";

const easeOut: [number, number, number, number] = [0.32, 0.72, 0, 1];

export function MyWalletsPanel(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  const { open, onClose, title, className, children } = props;
  const desktop = useDesktop();

  useEffect(() => {
    if (!open || desktop) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, desktop]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && !desktop ? (
        <motion.button
          key="my-wallets-mask"
          type="button"
          aria-label="Close"
          className="fixed inset-0 z-50 border-0 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.1, ease: easeOut } }}
          exit={{ opacity: 0, transition: { duration: 0.1, ease: easeOut } }}
          onClick={onClose}
        />
      ) : null}
      {open ? (
        <motion.div
          key="my-wallets-panel"
          role="dialog"
          aria-label={title}
          className={
            desktop
              ? "fixed top-[10px] right-[10px] z-[51] h-[calc(100%-20px)] w-[320px]"
              : "fixed bottom-0 left-0 z-[51] h-[calc(100%-70px)] w-full"
          }
          initial={desktop ? { x: "100%", opacity: 0 } : { y: "100%", opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1, transition: { duration: 0.3, ease: easeOut } }}
          exit={
            desktop
              ? { x: "100%", opacity: 0, transition: { duration: 0.2, ease: easeOut } }
              : { y: "100%", opacity: 0, transition: { duration: 0.2, ease: easeOut } }
          }
        >
          {desktop ? (
            <button
              type="button"
              aria-label="Collapse"
              onClick={onClose}
              className="cursor-pointer absolute top-1/2 left-0 z-[1] flex h-[214px] w-5 -translate-x-full -translate-y-1/2 items-center justify-center border-0 bg-transparent p-0"
            >
              <span className="flex h-full w-full items-center justify-center rounded-l-[12px] bg-white/90 text-[#9FA7BA] shadow-[0_0_10px_0_rgba(0,0,0,0.10)]">
                <IconChevron className="size-3" />
              </span>
            </button>
          ) : null}
          <div
            className={cx(
              desktop
                ? "flex h-full w-full flex-col overflow-hidden rounded-[16px] bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)]"
                : "flex h-full w-full flex-col overflow-hidden rounded-t-[16px] rounded-b-none bg-white shadow-[0_0_10px_0_rgba(0,0,0,0.10)]",
              className,
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 px-5 py-4">
              <span className="min-w-0 flex-1 text-[18px] font-medium text-black">{title}</span>
              <button type="button" aria-label="Close" className="cursor-pointer text-[#A1A699]" onClick={onClose}>
                <IconClose className="size-[15px]" />
              </button>
            </div>
            {children}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
