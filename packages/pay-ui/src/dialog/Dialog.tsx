import { motion } from "motion/react";
import { cn } from "../lib/cn";
import { useMediaQuery } from "../hooks/use-media-query";
import { Overlay } from "../overlay/Overlay";
import { OverlayPanel } from "../overlay/OverlayPanel";
import { DESKTOP_MEDIA_QUERY, OVERLAY_DIALOG_PANEL_FADE_SECONDS } from "../overlay/config";
import type { OverlayChromeProps } from "../overlay/types";
import { Drawer } from "../drawer/Drawer";
import { DRAWER_SIDE } from "../drawer/config";

export type DialogProps = OverlayChromeProps;

export function Dialog(props: DialogProps) {
  const {
    open,
    onClose,
    title,
    ariaLabel,
    children,
    mask = true,
    maskClassName,
    closeOnMaskClick = true,
    cardClassName,
    titleClassName,
    closeClassName,
    closeIcon,
    headerAction,
    contentClassName,
  } = props;
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);

  if (!isDesktop) {
    return (
      <Drawer
        {...props}
        side={DRAWER_SIDE.Bottom}
        cardClassName={cn("w-full rounded-b-none", cardClassName)}
      />
    );
  }

  return (
    <Overlay
      open={open}
      onClose={onClose}
      mask={mask}
      maskClassName={maskClassName}
      closeOnMaskClick={closeOnMaskClick}
      elevated={props.elevated}
    >
      <div className="pointer-events-none relative flex size-full items-center justify-center p-4">
        <motion.div
          className="pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: OVERLAY_DIALOG_PANEL_FADE_SECONDS, delay: 0 },
          }}
          exit={{
            opacity: 0,
            transition: { duration: OVERLAY_DIALOG_PANEL_FADE_SECONDS, delay: 0 },
          }}
        >
          <OverlayPanel
            title={title}
            ariaLabel={ariaLabel}
            titleClassName={titleClassName}
            closeClassName={closeClassName}
            closeIcon={closeIcon}
            headerAction={headerAction}
            contentClassName={contentClassName}
            onClose={onClose}
            cardClassName={cn("w-full max-h-[90vh] md:w-[500px]", cardClassName)}
            trapFocus={mask}
          >
            {children}
          </OverlayPanel>
        </motion.div>
      </div>
    </Overlay>
  );
}

export default Dialog;
