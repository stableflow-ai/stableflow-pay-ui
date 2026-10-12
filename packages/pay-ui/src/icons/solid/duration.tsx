import type { IconProps } from "../types";

export const IconDuration = (props: IconProps) => {
  const {
    className,
    style,
  } = props;

  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <path
        d="M9.5 19C4.25362 19 0 14.7464 0 9.5C0 4.25362 4.25362 0 9.5 0C14.7464 0 19 4.25362 19 9.5C19 14.7464 14.7464 19 9.5 19ZM10.2917 9.96629V5.53929C10.2917 5.10862 9.937 4.75 9.5 4.75C9.05983 4.75 8.70833 5.10308 8.70833 5.53929V10.294C8.70767 10.3968 8.72733 10.4986 8.76618 10.5937C8.80504 10.6889 8.86233 10.7753 8.93475 10.8482L11.1847 13.0981C11.2581 13.1711 11.3452 13.2288 11.4409 13.268C11.5367 13.3073 11.6393 13.3272 11.7428 13.3267C11.8462 13.3262 11.9486 13.3052 12.044 13.265C12.1394 13.2249 12.2259 13.1663 12.2985 13.0926C12.446 12.9451 12.5293 12.7454 12.5303 12.5368C12.5314 12.3282 12.4501 12.1277 12.3041 11.9787L10.2917 9.96629Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default IconDuration;

export const IconDuration2 = (props: IconProps) => {
  const {
    className,
    style,
  } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={className ? `sfp-icon ${className}` : "sfp-icon"}
      style={style}
    >
      <path
        opacity="0.5"
        d="M7 0C3.1348 0 0 3.1348 0 7C0 10.8652 3.13323 14 7 14C10.8668 14 14 10.8668 14 7C14 3.1348 10.8668 0 7 0ZM8.83542 7.71003H6.88244C6.4906 7.71003 6.17241 7.39185 6.17241 7V3.28997C6.17241 2.89812 6.4906 2.57994 6.88244 2.57994C7.27429 2.57994 7.59248 2.89812 7.59248 3.28997V6.29154H8.83542C9.22727 6.29154 9.54545 6.60972 9.54545 7.00157C9.54545 7.39342 9.22727 7.71003 8.83542 7.71003Z"
        fill="currentColor"
      />
    </svg>
  );
};
