import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

export function LazyImage(props: {
  src: string;
  fallbackSrc: string;
  alt?: string;
  className?: string;
}) {
  const { src, fallbackSrc, alt = "", className } = props;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  useEffect(() => {
    setFailedSrc(null);
  }, [src]);

  const requested = src.trim();
  const useFallback = requested.length === 0 || failedSrc === requested;
  const shown = useFallback ? fallbackSrc : requested;

  return (
    <span ref={ref} className="block size-full">
      {inView ? (
        <img
          src={shown}
          alt={alt}
          className={className}
          onError={() => {
            if (!useFallback) setFailedSrc(requested);
          }}
        />
      ) : null}
    </span>
  );
}
