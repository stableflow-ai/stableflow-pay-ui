import { useEffect, useState } from "react";
import { IconsPage } from "./icons-page";
import { MyWalletsPage } from "./my-wallets-page";
import { TokenSelectPage } from "./token-select-page";
import { WalletChainsButtonPage } from "./wallet-chains-button-page";
import { WalletSelectPage } from "./wallet-select-page";
import {
  AutocompletePage,
  ButtonPage,
  CardPage,
  CheckboxPage,
  DateRangePage,
  DialogPage,
  DrawerPage,
  DropdownPage,
  InputNumberPage,
  PaginationPage,
  SearchInputPage,
  SkeletonPage,
  SwitchPage,
  TablePage,
  ToastPage,
  TooltipPage,
} from "./pages";
import { Page } from "./theme";

const UI_PAGES = [
  ["button", "Button", ButtonPage],
  ["card", "Card", CardPage],
  ["checkbox", "Checkbox", CheckboxPage],
  ["dialog", "Dialog", DialogPage],
  ["drawer", "Drawer", DrawerPage],
  ["dropdown", "Dropdown", DropdownPage],
  ["autocomplete", "Autocomplete", AutocompletePage],
  ["tooltip", "Tooltip", TooltipPage],
  ["search-input", "Search input", SearchInputPage],
  ["skeleton", "Skeleton", SkeletonPage],
  ["pagination", "Pagination", PaginationPage],
  ["input-number", "Input number", InputNumberPage],
  ["switch", "Switch", SwitchPage],
  ["toast", "Toast", ToastPage],
  ["table", "Table", TablePage],
  ["date-range-picker", "Date range", DateRangePage],
  ["icons", "Icons", IconsPage],
] as const;

const WIDGET_PAGES = [
  ["token-select", "Token select", TokenSelectPage],
  ["wallet-select", "Wallet select", WalletSelectPage],
  ["my-wallets", "My Wallets", MyWalletsPage],
  ["wallet-chains-button", "Wallet chains", WalletChainsButtonPage],
] as const;

type PageId = "home" | (typeof UI_PAGES)[number][0] | (typeof WIDGET_PAGES)[number][0];

const COMPONENT_PAGES = [...UI_PAGES, ...WIDGET_PAGES];

function pageFromPath(pathname: string): PageId {
  const id = pathname.replace(/^\//, "").replace(/\/$/, "");
  if (!id) return "home";
  return COMPONENT_PAGES.some((item) => item[0] === id) ? (id as PageId) : "home";
}

function pathForPage(id: PageId): string {
  return id === "home" ? "/" : `/${id}`;
}

function HomePage(props: { onOpen: (id: PageId) => void }) {
  return (
    <Page title="StableFlow Pay UI">
      <button type="button" className="demo-home-card" onClick={() => props.onOpen(UI_PAGES[0][0])}>
        <strong>UI</strong>
        <span>Buttons, dialogs, inputs, and other primitives.</span>
      </button>
      <button type="button" className="demo-home-card" onClick={() => props.onOpen(WIDGET_PAGES[0][0])}>
        <strong>Widgets</strong>
        <span>Token select, wallet select, My Wallets, and the chain stack button.</span>
      </button>
    </Page>
  );
}

export function App() {
  const [page, setPageState] = useState<PageId>(() => pageFromPath(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setPageState(pageFromPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function setPage(id: PageId) {
    const path = pathForPage(id);
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
    setPageState(id);
  }

  const current = COMPONENT_PAGES.find((item) => item[0] === page);
  const Current = current?.[2];

  return (
    <div className="demo-shell">
      <nav className="demo-nav">
        <h2>Pay UI</h2>
        <button type="button" aria-current={page === "home" ? "page" : undefined} onClick={() => setPage("home")}>
          Home
        </button>
        <p className="demo-nav-label">UI</p>
        {UI_PAGES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="demo-nav-item"
            aria-current={id === page ? "page" : undefined}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
        <p className="demo-nav-label">Widgets</p>
        {WIDGET_PAGES.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className="demo-nav-item"
            aria-current={id === page ? "page" : undefined}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <main className="demo-main">{Current ? <Current /> : <HomePage onOpen={setPage} />}</main>
    </div>
  );
}
