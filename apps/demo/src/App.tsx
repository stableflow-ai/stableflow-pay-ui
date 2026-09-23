import { useState } from "react";
import { IconsPage } from "./icons-page";
import { TokenSelectPage } from "./token-select-page";
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

const WIDGET_PAGES = [["token-select", "Token select", TokenSelectPage]] as const;

type PageId = "home" | (typeof UI_PAGES)[number][0] | (typeof WIDGET_PAGES)[number][0];

const COMPONENT_PAGES = [...UI_PAGES, ...WIDGET_PAGES];

function HomePage(props: { onOpen: (id: PageId) => void }) {
  return (
    <Page title="Stableflow Pay UI">
      <button type="button" className="demo-home-card" onClick={() => props.onOpen(UI_PAGES[0][0])}>
        <strong>UI</strong>
        <span>Buttons, dialogs, inputs, and other primitives.</span>
      </button>
      <button type="button" className="demo-home-card" onClick={() => props.onOpen(WIDGET_PAGES[0][0])}>
        <strong>Widgets</strong>
        <span>Token select and other composed flows.</span>
      </button>
    </Page>
  );
}

export function App() {
  const [page, setPage] = useState<PageId>("home");
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
