import type { ChangeEvent, DetailedHTMLProps, InputHTMLAttributes } from "react";
import { cn } from "../lib/cn";
import { fontSans } from "../lib/font";

export type InputNumberProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  onNumberChange?: (value: string) => void;
  decimals?: number;
};

export function InputNumber(props: InputNumberProps) {
  const { onChange, onNumberChange, decimals, className, ...restProps } = props;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let temp = event.target.value;
    if (temp) {
      temp = temp.replace(/[^\d.]/g, "");

      if (temp.length && temp.indexOf(".") !== temp.lastIndexOf(".")) {
        const parts = temp.split(".");
        const first = parts.shift();
        temp = `${first}.${parts.join("")}`;
      }

      while (/^0[0-9]/.test(temp)) {
        temp = temp.substring(1);
      }

      if (temp === ".") temp = "";

      if (decimals !== undefined && temp.includes(".")) {
        const parts = temp.split(".");
        if (parts[1] && parts[1].length > decimals) {
          parts[1] = parts[1].substring(0, decimals);
          temp = parts.join(".");
        }
      }
    }
    event.target.value = temp;
    onChange?.(event);
    onNumberChange?.(temp);
  };

  return (
    <input
      {...restProps}
      type="text"
      inputMode="decimal"
      className={cn(
        "box-border h-9 w-full appearance-none rounded-[6px] border border-[#e3e3e3] bg-white px-3 text-sm font-medium text-black outline-none",
        fontSans,
        className,
      )}
      onChange={handleChange}
    />
  );
}

export default InputNumber;
