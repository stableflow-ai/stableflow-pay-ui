import { useState } from "react";
import { Autocomplete } from "@stableflow/pay-ui/autocomplete";
import { Button, BUTTON_SIZE, BUTTON_VARIANT } from "@stableflow/pay-ui/button";
import { Card } from "@stableflow/pay-ui/card";
import { Checkbox } from "@stableflow/pay-ui/checkbox";
import { DateRangePicker, lastNDaysRange } from "@stableflow/pay-ui/date-range-picker";
import { Dialog } from "@stableflow/pay-ui/dialog";
import { Drawer, DRAWER_SIDE, type DrawerSide } from "@stableflow/pay-ui/drawer";
import { Dropdown } from "@stableflow/pay-ui/dropdown";
import { InputNumber } from "@stableflow/pay-ui/input-number";
import { Pagination } from "@stableflow/pay-ui/pagination";
import { SearchInput } from "@stableflow/pay-ui/search-input";
import { Skeleton } from "@stableflow/pay-ui/skeleton";
import { Switch } from "@stableflow/pay-ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@stableflow/pay-ui/table";
import { Toast, ToastType } from "@stableflow/pay-ui/toast";
import { Tooltip } from "@stableflow/pay-ui/tooltip";
import { Page } from "./theme";

const OPTIONS = [
  { value: "eth", label: "Ethereum" },
  { value: "sol", label: "Solana" },
  { value: "tron", label: "Tron" },
];

export function ButtonPage() {
  return (
    <Page title="Button">
      <Button size={BUTTON_SIZE.Xl}>XL</Button>
      <Button size={BUTTON_SIZE.Lg}>LG</Button>
      <Button size={BUTTON_SIZE.Md}>MD</Button>
      <Button size={BUTTON_SIZE.Sm}>SM</Button>
      <Button variant={BUTTON_VARIANT.Normal}>Normal</Button>
      <Button variant={BUTTON_VARIANT.Danger}>Danger</Button>
      <Button loading>Loading</Button>
      <Button className="bg-[#4DA0FF]">className</Button>
    </Page>
  );
}

export function CardPage() {
  return (
    <Page title="Card">
      <Card>Card surface</Card>
    </Page>
  );
}

export function CheckboxPage() {
  return (
    <Page title="Checkbox">
      <Checkbox defaultChecked aria-label="Checked" />
      <Checkbox aria-label="Unchecked" />
    </Page>
  );
}

export function DialogPage() {
  const [open, setOpen] = useState(false);
  return (
    <Page title="Dialog">
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Dialog" cardClassName="md:w-[420px]">
        Dialog body
      </Dialog>
    </Page>
  );
}

export function DrawerPage() {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<DrawerSide>(DRAWER_SIDE.Right);
  return (
    <Page title="Drawer">
      <Button
        onClick={() => {
          setOpen(true);
          setDirection(DRAWER_SIDE.Right);
        }}
      >
        Open drawer Right
      </Button>
      <Button
        onClick={() => {
          setOpen(true);
          setDirection(DRAWER_SIDE.Left);
        }}
      >
        Open drawer Left
      </Button>
      <Button
        onClick={() => {
          setOpen(true);
          setDirection(DRAWER_SIDE.Bottom);
        }}
      >
        Open drawer Bottom
      </Button>
      <Button
        onClick={() => {
          setOpen(true);
          setDirection(DRAWER_SIDE.Top);
        }}
      >
        Open drawer Top
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Drawer" side={direction} cardClassName="bg-[#f6f6f6]">
        Drawer body
      </Drawer>
    </Page>
  );
}

export function DropdownPage() {
  const [value, setValue] = useState("eth");
  return (
    <Page title="Dropdown">
      <Dropdown value={value} onChange={setValue} options={OPTIONS} />
    </Page>
  );
}

export function AutocompletePage() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  return (
    <Page title="Autocomplete">
      <Autocomplete
        open={open}
        onOpenChange={setOpen}
        value={value}
        options={OPTIONS}
        onSelect={(next) => {
          setValue(next);
          setOpen(false);
        }}
      >
        <SearchInput value={value} onChange={setValue} onFocus={() => setOpen(true)} placeholder="Search chains" />
      </Autocomplete>
    </Page>
  );
}

export function TooltipPage() {
  return (
    <Page title="Tooltip">
      <Tooltip content="Tooltip copy">
        <Button variant={BUTTON_VARIANT.Normal}>Hover</Button>
      </Tooltip>
    </Page>
  );
}

export function SearchInputPage() {
  const [value, setValue] = useState("");
  return (
    <Page title="Search input">
      <SearchInput value={value} onChange={setValue} placeholder="Search" inputClassName="bg-[#f6f6f6]" />
    </Page>
  );
}

export function SkeletonPage() {
  return (
    <Page title="Skeleton">
      <Skeleton className="demo-skeleton" />
    </Page>
  );
}

export function PaginationPage() {
  const [page, setPage] = useState(1);
  return (
    <Page title="Pagination">
      <Pagination page={page} totalPage={8} onPageChange={setPage} />
    </Page>
  );
}

export function InputNumberPage() {
  const [value, setValue] = useState("1.25");
  return (
    <Page title="Input number">
      <InputNumber value={value} onNumberChange={setValue} decimals={2} />
    </Page>
  );
}

export function SwitchPage() {
  return (
    <Page title="Switch">
      <Switch defaultChecked aria-label="On" />
      <Switch aria-label="Off" />
    </Page>
  );
}

export function ToastPage() {
  return (
    <Page title="Toast">
      <div className="demo-stack">
        <Toast type={ToastType.Success} title="Paid" text="The transfer settled." />
        <Toast type={ToastType.Error} title="Failed" text="The transfer was rejected." />
        <Toast type={ToastType.Info} title="Info" />
        <Toast type={ToastType.Pending} title="Pending" />
        <Toast type={ToastType.Notice} title="Notice" />
      </div>
    </Page>
  );
}

export function TablePage() {
  return (
    <Page title="Table">
      <Table columns="1fr 1fr" className="demo-table">
        <TableHeader>
          <TableHead>Token</TableHead>
          <TableHead>Amount</TableHead>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>USDC</TableCell>
            <TableCell>1,250.50</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Page>
  );
}

export function DateRangePage() {
  const [value, setValue] = useState(() => lastNDaysRange(7));
  return (
    <Page title="Date range">
      <DateRangePicker value={value} onChange={setValue} />
    </Page>
  );
}
