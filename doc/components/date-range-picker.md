# date-range-picker

Date range picker and range helpers.

Import `@stableflow/pay-ui/date-range-picker`.

```ts
import { DateRangePicker, lastNDaysRange } from "@stableflow/pay-ui/date-range-picker";
```

The trigger sizes to its label. Preset labels stay compact. A custom range grows to fit `MMM d, yyyy – MMM d, yyyy`. Do not set a fixed width on the root, or the label is clipped.

The trigger keeps showing the committed range while a new start day is only a draft. That draft highlights only the new start. Closing the panel without an end day (outside click, Escape, or the trigger) drops the draft and leaves the previous range selected.
