import type { IconProps } from "../types";

export const IconDatabase = (props: IconProps) => {
  const {
    className,
    style,
  } = props;

  return (
    <svg
      width="13"
      height="14"
      viewBox="0 0 13 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <path
        d="M13 4.78947V7C13 8.83105 10.0894 10.3158 6.5 10.3158C2.91056 10.3158 0 8.83105 0 7V4.78947C0 6.62053 2.91056 8.10526 6.5 8.10526C10.0894 8.10526 13 6.62053 13 4.78947ZM0 8.47368C0 10.3047 2.91056 11.7895 6.5 11.7895C10.0894 11.7895 13 10.3047 13 8.47368V10.6842C13 12.5153 10.0894 14 6.5 14C2.91056 14 0 12.5153 0 10.6842V8.47368ZM6.5 6.63158C2.91056 6.63158 0 5.14684 0 3.31579C0 1.48474 2.91056 0 6.5 0C10.0894 0 13 1.48474 13 3.31579C13 5.14684 10.0894 6.63158 6.5 6.63158Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default IconDatabase;
