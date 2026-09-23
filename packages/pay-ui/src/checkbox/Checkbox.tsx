import { useState, type ButtonHTMLAttributes } from "react";
import { IconCheck } from "../icons/check";
import { cn } from "../lib/cn";

export type CheckboxProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange" | "role" | "aria-checked" | "children"
> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function Checkbox(props: CheckboxProps) {
  const {
    checked,
    defaultChecked = false,
    onCheckedChange,
    disabled,
    className,
    type = "button",
    onClick,
    ...restProps
  } = props;
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const isChecked = checked ?? uncontrolledChecked;

  const toggle = () => {
    const nextChecked = !isChecked;
    if (checked === undefined) setUncontrolledChecked(nextChecked);
    onCheckedChange?.(nextChecked);
  };

  return (
    <button
      type={type}
      role="checkbox"
      aria-checked={isChecked}
      disabled={disabled}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        toggle();
      }}
      className={cn(
        "inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-[#e3e3e3] bg-white p-0 text-white outline-none select-none aria-checked:bg-[#6284F5]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-30",
        className,
      )}
      {...restProps}
    >
      {isChecked ? <IconCheck className="size-2.5 text-white" /> : null}
    </button>
  );
}

export default Checkbox;
