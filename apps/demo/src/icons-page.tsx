import type { ComponentType } from "react";
import type { IconProps } from "@stableflow/pay-ui/icons/types";
import { IconAlert } from "@stableflow/pay-ui/icons/outline/alert";
import { IconAlertCircle } from "@stableflow/pay-ui/icons/solid/alert-circle";
import { IconAllNetworks } from "@stableflow/pay-ui/icons/outline/all-networks";
import { IconArrowDown } from "@stableflow/pay-ui/icons/outline/arrow-down";
import { IconBonus } from "@stableflow/pay-ui/icons/outline/bonus";
import { IconBook } from "@stableflow/pay-ui/icons/outline/book";
import { IconCalendar } from "@stableflow/pay-ui/icons/outline/calendar";
import { IconCash } from "@stableflow/pay-ui/icons/outline/cash";
import { IconCheck } from "@stableflow/pay-ui/icons/outline/check";
import { IconChevron } from "@stableflow/pay-ui/icons/outline/chevron";
import { IconClose } from "@stableflow/pay-ui/icons/outline/close";
import { IconCloud } from "@stableflow/pay-ui/icons/outline/cloud";
import { IconCode } from "@stableflow/pay-ui/icons/outline/code";
import { IconCopy } from "@stableflow/pay-ui/icons/outline/copy";
import { IconDatabaseOutline } from "@stableflow/pay-ui/icons/outline/database";
import { IconDelete } from "@stableflow/pay-ui/icons/outline/delete";
import { IconDown } from "@stableflow/pay-ui/icons/outline/down";
import { IconDownload } from "@stableflow/pay-ui/icons/outline/download";
import { IconDurationOutline } from "@stableflow/pay-ui/icons/outline/duration";
import { IconEmail } from "@stableflow/pay-ui/icons/outline/email";
import { IconExpenseUser } from "@stableflow/pay-ui/icons/outline/expense-user";
import { IconExpense } from "@stableflow/pay-ui/icons/outline/expense";
import { IconEyeHidden } from "@stableflow/pay-ui/icons/outline/eye-hidden";
import { IconFee } from "@stableflow/pay-ui/icons/solid/fee";
import { IconFlask } from "@stableflow/pay-ui/icons/outline/flask";
import { IconGoogle } from "@stableflow/pay-ui/icons/solid/google";
import { IconGrants } from "@stableflow/pay-ui/icons/outline/grants";
import { IconGuard } from "@stableflow/pay-ui/icons/outline/guard";
import { IconHistory } from "@stableflow/pay-ui/icons/outline/history";
import { IconImportFile } from "@stableflow/pay-ui/icons/outline/import-file";
import { IconKey } from "@stableflow/pay-ui/icons/outline/key";
import { IconKolMkt } from "@stableflow/pay-ui/icons/outline/kol-mkt";
import { IconLink, IconOutLink, IconExportLink } from "@stableflow/pay-ui/icons/outline/link";
import { IconLoading } from "@stableflow/pay-ui/icons/outline/loading";
import { IconLock } from "@stableflow/pay-ui/icons/solid/lock";
import { IconLogout } from "@stableflow/pay-ui/icons/outline/logout";
import { IconMeno } from "@stableflow/pay-ui/icons/outline/meno";
import { IconMember } from "@stableflow/pay-ui/icons/outline/member";
import { IconMenu } from "@stableflow/pay-ui/icons/outline/menu";
import { IconMoney } from "@stableflow/pay-ui/icons/solid/money";
import { IconNode } from "@stableflow/pay-ui/icons/solid/node";
import { IconOffice } from "@stableflow/pay-ui/icons/outline/office";
import { IconOperations } from "@stableflow/pay-ui/icons/outline/operations";
import { IconOtcTreasury } from "@stableflow/pay-ui/icons/outline/otc-treasury";
import { IconOutsourcing } from "@stableflow/pay-ui/icons/outline/outsourcing";
import { IconOverview } from "@stableflow/pay-ui/icons/outline/overview";
import { IconPay } from "@stableflow/pay-ui/icons/outline/pay";
import { IconPayroll } from "@stableflow/pay-ui/icons/outline/payroll";
import { IconPen } from "@stableflow/pay-ui/icons/solid/pen";
import { IconPlus } from "@stableflow/pay-ui/icons/outline/plus";
import { IconPrivate } from "@stableflow/pay-ui/icons/outline/private";
import { IconProcurement } from "@stableflow/pay-ui/icons/outline/procurement";
import { IconQuestion } from "@stableflow/pay-ui/icons/outline/question";
import { IconReceipt } from "@stableflow/pay-ui/icons/outline/receipt";
import { IconRecords, IconRecords2 } from "@stableflow/pay-ui/icons/outline/records";
import { IconRefresh } from "@stableflow/pay-ui/icons/outline/refresh";
import { IconReimbursement } from "@stableflow/pay-ui/icons/outline/reimbursement";
import { IconRemove } from "@stableflow/pay-ui/icons/outline/remove";
import { IconRequest } from "@stableflow/pay-ui/icons/outline/request";
import { IconResetPassword } from "@stableflow/pay-ui/icons/outline/reset-password";
import { IconSearch } from "@stableflow/pay-ui/icons/outline/search";
import { IconSetting } from "@stableflow/pay-ui/icons/outline/setting";
import { IconShield } from "@stableflow/pay-ui/icons/outline/shield";
import { IconSupport } from "@stableflow/pay-ui/icons/outline/support";
import { IconSwap } from "@stableflow/pay-ui/icons/outline/swap";
import { IconTeam } from "@stableflow/pay-ui/icons/outline/team";
import { Icon2Right } from "@stableflow/pay-ui/icons/outline/to-right";
import { IconUp, IconBatchUp } from "@stableflow/pay-ui/icons/outline/up";
import { IconWallet } from "@stableflow/pay-ui/icons/outline/wallet";
import { IconWebhooks } from "@stableflow/pay-ui/icons/outline/webhooks";
import { IconTrends } from "@stableflow/pay-ui/icons/outline/trends";
import { IconBack } from "@stableflow/pay-ui/icons/outline/back";
import { IconDatabase } from "@stableflow/pay-ui/icons/solid/database";
import { IconDuration, IconDuration2 } from "@stableflow/pay-ui/icons/solid/duration";
import { IconEye } from "@stableflow/pay-ui/icons/solid/eye";
import { IconPayoutPending, IconPayoutPaid } from "@stableflow/pay-ui/icons/solid/payout-status";
import { IconSuccess } from "@stableflow/pay-ui/icons/solid/success";
import { Page } from "./theme";

const OUTLINE: { file: string; name: string; Icon: ComponentType<IconProps> }[] = [
  { file: "alert", name: "IconAlert", Icon: IconAlert },
  { file: "all-networks", name: "IconAllNetworks", Icon: IconAllNetworks },
  { file: "arrow-down", name: "IconArrowDown", Icon: IconArrowDown },
  { file: "bonus", name: "IconBonus", Icon: IconBonus },
  { file: "book", name: "IconBook", Icon: IconBook },
  { file: "calendar", name: "IconCalendar", Icon: IconCalendar },
  { file: "cash", name: "IconCash", Icon: IconCash },
  { file: "check", name: "IconCheck", Icon: IconCheck },
  { file: "chevron", name: "IconChevron", Icon: IconChevron },
  { file: "close", name: "IconClose", Icon: IconClose },
  { file: "cloud", name: "IconCloud", Icon: IconCloud },
  { file: "code", name: "IconCode", Icon: IconCode },
  { file: "copy", name: "IconCopy", Icon: IconCopy },
  { file: "database", name: "IconDatabaseOutline", Icon: IconDatabaseOutline },
  { file: "delete", name: "IconDelete", Icon: IconDelete },
  { file: "down", name: "IconDown", Icon: IconDown },
  { file: "download", name: "IconDownload", Icon: IconDownload },
  { file: "duration", name: "IconDurationOutline", Icon: IconDurationOutline },
  { file: "email", name: "IconEmail", Icon: IconEmail },
  { file: "expense-user", name: "IconExpenseUser", Icon: IconExpenseUser },
  { file: "expense", name: "IconExpense", Icon: IconExpense },
  { file: "eye-hidden", name: "IconEyeHidden", Icon: IconEyeHidden },
  { file: "flask", name: "IconFlask", Icon: IconFlask },
  { file: "grants", name: "IconGrants", Icon: IconGrants },
  { file: "guard", name: "IconGuard", Icon: IconGuard },
  { file: "history", name: "IconHistory", Icon: IconHistory },
  { file: "import-file", name: "IconImportFile", Icon: IconImportFile },
  { file: "key", name: "IconKey", Icon: IconKey },
  { file: "kol-mkt", name: "IconKolMkt", Icon: IconKolMkt },
  { file: "link", name: "IconLink", Icon: IconLink },
  { file: "link", name: "IconOutLink", Icon: IconOutLink },
  { file: "link", name: "IconExportLink", Icon: IconExportLink },
  { file: "loading", name: "IconLoading", Icon: IconLoading },
  { file: "logout", name: "IconLogout", Icon: IconLogout },
  { file: "meno", name: "IconMeno", Icon: IconMeno },
  { file: "member", name: "IconMember", Icon: IconMember },
  { file: "menu", name: "IconMenu", Icon: IconMenu },
  { file: "office", name: "IconOffice", Icon: IconOffice },
  { file: "operations", name: "IconOperations", Icon: IconOperations },
  { file: "otc-treasury", name: "IconOtcTreasury", Icon: IconOtcTreasury },
  { file: "outsourcing", name: "IconOutsourcing", Icon: IconOutsourcing },
  { file: "overview", name: "IconOverview", Icon: IconOverview },
  { file: "pay", name: "IconPay", Icon: IconPay },
  { file: "payroll", name: "IconPayroll", Icon: IconPayroll },
  { file: "plus", name: "IconPlus", Icon: IconPlus },
  { file: "private", name: "IconPrivate", Icon: IconPrivate },
  { file: "procurement", name: "IconProcurement", Icon: IconProcurement },
  { file: "question", name: "IconQuestion", Icon: IconQuestion },
  { file: "receipt", name: "IconReceipt", Icon: IconReceipt },
  { file: "records", name: "IconRecords", Icon: IconRecords },
  { file: "records", name: "IconRecords2", Icon: IconRecords2 },
  { file: "refresh", name: "IconRefresh", Icon: IconRefresh },
  { file: "reimbursement", name: "IconReimbursement", Icon: IconReimbursement },
  { file: "remove", name: "IconRemove", Icon: IconRemove },
  { file: "request", name: "IconRequest", Icon: IconRequest },
  { file: "reset-password", name: "IconResetPassword", Icon: IconResetPassword },
  { file: "search", name: "IconSearch", Icon: IconSearch },
  { file: "setting", name: "IconSetting", Icon: IconSetting },
  { file: "shield", name: "IconShield", Icon: IconShield },
  { file: "support", name: "IconSupport", Icon: IconSupport },
  { file: "swap", name: "IconSwap", Icon: IconSwap },
  { file: "team", name: "IconTeam", Icon: IconTeam },
  { file: "to-right", name: "Icon2Right", Icon: Icon2Right },
  { file: "up", name: "IconUp", Icon: IconUp },
  { file: "up", name: "IconBatchUp", Icon: IconBatchUp },
  { file: "wallet", name: "IconWallet", Icon: IconWallet },
  { file: "webhooks", name: "IconWebhooks", Icon: IconWebhooks },
  { file: "back", name: "IconBack", Icon: IconBack },
  { file: "trends", name: "IconTrends", Icon: IconTrends },
];

const SOLID: { file: string; name: string; Icon: ComponentType<IconProps> }[] = [
  { file: "alert-circle", name: "IconAlertCircle", Icon: IconAlertCircle },
  { file: "database", name: "IconDatabase", Icon: IconDatabase },
  { file: "duration", name: "IconDuration", Icon: IconDuration },
  { file: "duration", name: "IconDuration2", Icon: IconDuration2 },
  { file: "eye", name: "IconEye", Icon: IconEye },
  { file: "fee", name: "IconFee", Icon: IconFee },
  { file: "google", name: "IconGoogle", Icon: IconGoogle },
  { file: "lock", name: "IconLock", Icon: IconLock },
  { file: "money", name: "IconMoney", Icon: IconMoney },
  { file: "node", name: "IconNode", Icon: IconNode },
  { file: "payout-status", name: "IconPayoutPending", Icon: IconPayoutPending },
  { file: "payout-status", name: "IconPayoutPaid", Icon: IconPayoutPaid },
  { file: "pen", name: "IconPen", Icon: IconPen },
  { file: "success", name: "IconSuccess", Icon: IconSuccess },
];

function IconGrid(props: { items: { file: string; name: string; Icon: ComponentType<IconProps> }[] }) {
  return (
    <div className="demo-icons">
      {props.items.map((item) => (
        <article key={item.name}>
          <item.Icon />
          <p>{item.file}</p>
          <p>{item.name}</p>
        </article>
      ))}
    </div>
  );
}

export function IconsPage() {
  return (
    <Page title="Icons">
      <h2>Outline</h2>
      <IconGrid items={OUTLINE} />
      <h2>Solid</h2>
      <IconGrid items={SOLID} />
    </Page>
  );
}
