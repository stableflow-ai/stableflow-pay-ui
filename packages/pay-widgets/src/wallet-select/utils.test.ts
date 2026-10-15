import { describe, expect, it } from "vitest";
import type { WalletSelectOption } from "./types";
import { walletSelectClick, walletSubtitle } from "./utils";

function wallet(overrides: Partial<WalletSelectOption> = {}): WalletSelectOption {
  return { id: "phantom", name: "Phantom", ...overrides };
}

describe("walletSubtitle", () => {
  it("uses the description when it has text", () => {
    expect(walletSubtitle(wallet({ description: "phantom.app" }))).toBe("phantom.app");
  });

  it("falls back to the name when the description is missing or blank", () => {
    expect(walletSubtitle(wallet())).toBe("Phantom");
    expect(walletSubtitle(wallet({ description: "  " }))).toBe("Phantom");
  });
});

describe("walletSelectClick", () => {
  it("selects an installed or unspecified wallet", () => {
    expect(walletSelectClick(wallet({ detected: true }))).toEqual({ type: "select" });
    expect(walletSelectClick(wallet())).toEqual({ type: "select" });
  });

  it("opens the install URL when the wallet is not detected", () => {
    expect(walletSelectClick(wallet({ detected: false, installUrl: " https://example.com/install " }))).toEqual({
      type: "install",
      url: "https://example.com/install",
    });
  });

  it("does nothing when a not-detected wallet has no install URL", () => {
    expect(walletSelectClick(wallet({ detected: false }))).toEqual({ type: "none" });
    expect(walletSelectClick(wallet({ detected: false, installUrl: " " }))).toEqual({ type: "none" });
  });

  it("does nothing for a disabled row or the connecting row", () => {
    expect(walletSelectClick(wallet({ disabled: true, detected: true }))).toEqual({ type: "none" });
    expect(walletSelectClick(wallet({ detected: false, installUrl: "https://example.com" }), "phantom")).toEqual({
      type: "none",
    });
    expect(walletSelectClick(wallet({ id: "solflare" }), "phantom")).toEqual({ type: "select" });
  });
});
