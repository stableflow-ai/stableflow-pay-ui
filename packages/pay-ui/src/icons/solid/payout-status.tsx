import type { IconProps } from "../types";

export const IconPayoutPending = (props: IconProps) => {
  const { className, style } = props;

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <circle opacity="0.2" cx="13" cy="13" r="13" fill="currentColor" />
      <path
        d="M17.875 13C17.875 10.3076 15.6924 8.125 13 8.125C10.3076 8.125 8.125 10.3076 8.125 13C8.125 15.6924 10.3076 17.875 13 17.875"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const IconPayoutPaid = (props: IconProps) => {
  const { className, style } = props;

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <path
        opacity="0.2"
        d="M13 0C5.84999 0 2.91488e-08 5.84999 0 13C0 20.15 5.84999 26 13 26C20.15 26 26 20.15 26 13C26 5.84999 20.15 0 13 0Z"
        fill="currentColor"
      />
      <path
        d="M12.6425 17.4851C12.4041 17.7451 12.0919 17.875 11.7797 17.875C11.4674 17.875 11.1551 17.7451 10.9169 17.4851L6.84911 13.0491C6.59805 12.7754 6.48757 12.4133 6.50111 12.0553C6.51306 11.733 6.62348 11.4134 6.84911 11.1674C7.07471 10.9212 7.36782 10.8008 7.6634 10.7877C7.99157 10.7731 8.32367 10.8935 8.57467 11.1674L11.7797 14.6624L17.4253 8.50572C17.6763 8.23193 18.0085 8.11144 18.3366 8.12621C18.6322 8.13932 18.9253 8.25966 19.1509 8.50572C19.3766 8.75174 19.4869 9.07153 19.4989 9.39372C19.5124 9.75159 19.402 10.1138 19.1509 10.3875L12.6425 17.4851Z"
        fill="currentColor"
      />
    </svg>
  );
};
