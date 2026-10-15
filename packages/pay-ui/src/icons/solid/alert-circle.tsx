import type { IconProps } from "../types";

export const IconAlertCircle = (props: IconProps) => {
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
        d="M13 16.3555C12.569 16.3555 12.1557 16.5211 11.851 16.816C11.5462 17.1108 11.375 17.5107 11.375 17.9277C11.375 18.3447 11.5462 18.7446 11.851 19.0395C12.1557 19.3343 12.569 19.5 13 19.5C13.431 19.5 13.8443 19.3343 14.149 19.0395C14.4538 18.7446 14.625 18.3447 14.625 17.9277C14.625 17.5107 14.4538 17.1108 14.149 16.816C13.8443 16.5211 13.431 16.3555 13 16.3555ZM13 7.31392C12.1019 7.31392 11.375 8.01726 11.375 8.88618L11.375 13.211C11.375 13.6279 11.5462 14.0279 11.851 14.3227C12.1557 14.6176 12.569 14.7832 13 14.7832C13.431 14.7832 13.8443 14.6176 14.149 14.3227C14.4538 14.0279 14.625 13.6279 14.625 13.211V8.88476C14.625 8.01584 13.8981 7.3125 13.0015 7.3125L13 7.31392Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default IconAlertCircle;
