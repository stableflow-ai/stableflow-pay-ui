export const OVERLAY_BASE_Z_INDEX = 1000;
export const OVERLAY_Z_INDEX_STEP = 10;
/** Portalled menus and tooltips when no overlay is open. */
export const FLOATING_LAYER_Z_INDEX = 1100;
/** Wallet portals must sit above Overlay. */
export const WALLET_PORTAL_Z_INDEX = 10000;

export const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

/** Mask fade in and out. The panel enter waits so the mask shows first. */
export const OVERLAY_MASK_FADE_SECONDS = 0.1;
/** Dialog panel fade on open and close. */
export const OVERLAY_DIALOG_PANEL_FADE_SECONDS = 0.1;
/** Drawer panel slide. */
export const OVERLAY_PANEL_SLIDE_SECONDS = 0.2;
export const OVERLAY_EXIT_SECONDS = OVERLAY_MASK_FADE_SECONDS + OVERLAY_PANEL_SLIDE_SECONDS;
