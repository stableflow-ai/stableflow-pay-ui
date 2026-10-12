import type { IconProps } from "../types";

export const IconEye = (props: IconProps) => {
  const {
    className,
    style,
  } = props;

  return (
    <svg
      width="16"
      height="11"
      viewBox="0 0 16 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <path
        d="M7.99168 0C4.49532 0 1.13215 2.28594 0 5.5C1.13215 8.71406 4.49532 11 7.99168 11C11.4714 11 14.8678 8.71406 16 5.5C14.8512 2.28594 11.4714 0 7.99168 0ZM7.99168 8.9375C6.16025 8.9375 4.66181 7.39062 4.66181 5.5C4.66181 3.60938 6.16025 2.0625 7.99168 2.0625C9.8231 2.0625 11.3215 3.60938 11.3215 5.5C11.3215 7.39062 9.8231 8.9375 7.99168 8.9375ZM9.98959 5.5C9.98959 6.63437 9.09053 7.5625 7.99168 7.5625C6.89282 7.5625 5.99376 6.63437 5.99376 5.5C5.99376 4.36563 6.89282 3.4375 7.99168 3.4375C9.09053 3.4375 9.98959 4.36563 9.98959 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default IconEye;
