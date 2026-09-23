import type { ComponentType } from "react";
import type { IconProps } from "@stableflow/pay-ui/icons/types";
import { IconAlert } from "@stableflow/pay-ui/icons/alert";
import { IconAllNetworks } from "@stableflow/pay-ui/icons/all-networks";
import { IconArrowDown } from "@stableflow/pay-ui/icons/arrow-down";
import { IconBonus } from "@stableflow/pay-ui/icons/bonus";
import { IconBook } from "@stableflow/pay-ui/icons/book";
import { IconCalendar } from "@stableflow/pay-ui/icons/calendar";
import { IconCash } from "@stableflow/pay-ui/icons/cash";
import { IconCheck } from "@stableflow/pay-ui/icons/check";
import { IconChevron } from "@stableflow/pay-ui/icons/chevron";
import { IconClose } from "@stableflow/pay-ui/icons/close";
import { IconCloud } from "@stableflow/pay-ui/icons/cloud";
import { IconCode } from "@stableflow/pay-ui/icons/code";
import { IconCopy } from "@stableflow/pay-ui/icons/copy";
import { IconDatabase } from "@stableflow/pay-ui/icons/database";
import { IconDelete } from "@stableflow/pay-ui/icons/delete";
import { IconDownload } from "@stableflow/pay-ui/icons/download";
import { IconDuration } from "@stableflow/pay-ui/icons/duration";
import { IconEmail } from "@stableflow/pay-ui/icons/email";
import { IconExpenseUser } from "@stableflow/pay-ui/icons/expense-user";
import { IconExpense } from "@stableflow/pay-ui/icons/expense";
import { IconEye, IconEyeHidden } from "@stableflow/pay-ui/icons/eye";
import { IconFee } from "@stableflow/pay-ui/icons/fee";
import { IconFlask } from "@stableflow/pay-ui/icons/flask";
import { IconGoogle } from "@stableflow/pay-ui/icons/google";
import { IconGrants } from "@stableflow/pay-ui/icons/grants";
import { IconGuard } from "@stableflow/pay-ui/icons/guard";
import { IconHistory } from "@stableflow/pay-ui/icons/history";
import { IconImportFile } from "@stableflow/pay-ui/icons/import-file";
import { IconKey } from "@stableflow/pay-ui/icons/key";
import { IconKolMkt } from "@stableflow/pay-ui/icons/kol-mkt";
import { IconLink, IconOutLink, IconExportLink } from "@stableflow/pay-ui/icons/link";
import { IconLoading } from "@stableflow/pay-ui/icons/loading";
import { IconLock } from "@stableflow/pay-ui/icons/lock";
import { IconLogout } from "@stableflow/pay-ui/icons/logout";
import { IconMeno } from "@stableflow/pay-ui/icons/meno";
import { IconMenu } from "@stableflow/pay-ui/icons/menu";
import { IconMoney } from "@stableflow/pay-ui/icons/money";
import { IconNode } from "@stableflow/pay-ui/icons/node";
import { IconOffice } from "@stableflow/pay-ui/icons/office";
import { IconOperations } from "@stableflow/pay-ui/icons/operations";
import { IconOtcTreasury } from "@stableflow/pay-ui/icons/otc-treasury";
import { IconOutsourcing } from "@stableflow/pay-ui/icons/outsourcing";
import { IconOverview } from "@stableflow/pay-ui/icons/overview";
import { IconPay } from "@stableflow/pay-ui/icons/pay";
import { IconPayment } from "@stableflow/pay-ui/icons/payment";
import { IconPayroll } from "@stableflow/pay-ui/icons/payroll";
import { IconPen } from "@stableflow/pay-ui/icons/pen";
import { IconPlus } from "@stableflow/pay-ui/icons/plus";
import { IconProcurement } from "@stableflow/pay-ui/icons/procurement";
import { IconQuestion } from "@stableflow/pay-ui/icons/question";
import { IconReceipt } from "@stableflow/pay-ui/icons/receipt";
import { IconRecords, IconRecords2 } from "@stableflow/pay-ui/icons/records";
import { IconRefresh } from "@stableflow/pay-ui/icons/refresh";
import { IconReimbursement } from "@stableflow/pay-ui/icons/reimbursement";
import { IconRemove } from "@stableflow/pay-ui/icons/remove";
import { IconRequest } from "@stableflow/pay-ui/icons/request";
import { IconResetPassword } from "@stableflow/pay-ui/icons/reset-password";
import { IconSearch } from "@stableflow/pay-ui/icons/search";
import { IconSetting } from "@stableflow/pay-ui/icons/setting";
import { IconShield } from "@stableflow/pay-ui/icons/shield";
import { IconSupport } from "@stableflow/pay-ui/icons/support";
import { IconSwap } from "@stableflow/pay-ui/icons/swap";
import { IconTeam } from "@stableflow/pay-ui/icons/team";
import { Icon2Right } from "@stableflow/pay-ui/icons/to-right";
import { IconUp, IconBatchUp } from "@stableflow/pay-ui/icons/up";
import { IconWallet } from "@stableflow/pay-ui/icons/wallet";
import { IconWebhooks } from "@stableflow/pay-ui/icons/webhooks";
import { Page } from "./theme";

const ICONS: { file: string; name: string; Icon: ComponentType<IconProps> }[] = [
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
  { file: "database", name: "IconDatabase", Icon: IconDatabase },
  { file: "delete", name: "IconDelete", Icon: IconDelete },
  { file: "download", name: "IconDownload", Icon: IconDownload },
  { file: "duration", name: "IconDuration", Icon: IconDuration },
  { file: "email", name: "IconEmail", Icon: IconEmail },
  { file: "expense-user", name: "IconExpenseUser", Icon: IconExpenseUser },
  { file: "expense", name: "IconExpense", Icon: IconExpense },
  { file: "eye", name: "IconEye", Icon: IconEye },
  { file: "eye", name: "IconEyeHidden", Icon: IconEyeHidden },
  { file: "fee", name: "IconFee", Icon: IconFee },
  { file: "flask", name: "IconFlask", Icon: IconFlask },
  { file: "google", name: "IconGoogle", Icon: IconGoogle },
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
  { file: "lock", name: "IconLock", Icon: IconLock },
  { file: "logout", name: "IconLogout", Icon: IconLogout },
  { file: "meno", name: "IconMeno", Icon: IconMeno },
  { file: "menu", name: "IconMenu", Icon: IconMenu },
  { file: "money", name: "IconMoney", Icon: IconMoney },
  { file: "node", name: "IconNode", Icon: IconNode },
  { file: "office", name: "IconOffice", Icon: IconOffice },
  { file: "operations", name: "IconOperations", Icon: IconOperations },
  { file: "otc-treasury", name: "IconOtcTreasury", Icon: IconOtcTreasury },
  { file: "outsourcing", name: "IconOutsourcing", Icon: IconOutsourcing },
  { file: "overview", name: "IconOverview", Icon: IconOverview },
  { file: "pay", name: "IconPay", Icon: IconPay },
  { file: "payment", name: "IconPayment", Icon: IconPayment },
  { file: "payroll", name: "IconPayroll", Icon: IconPayroll },
  { file: "pen", name: "IconPen", Icon: IconPen },
  { file: "plus", name: "IconPlus", Icon: IconPlus },
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
];

export function IconsPage() {
  return (
    <Page title="Icons">
      <div className="demo-icons">
        {ICONS.map((item) => (
          <article key={item.name}>
            <item.Icon />
            <p>{item.file}</p>
            <p>{item.name}</p>
          </article>
        ))}
      </div>
    </Page>
  );
}
