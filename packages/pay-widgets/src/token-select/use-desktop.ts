import { useEffect, useState } from "react";
import { DESKTOP_MEDIA_QUERY } from "./config";

export function useDesktop(): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia(DESKTOP_MEDIA_QUERY).matches;
  });

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = () => setMatches(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return matches;
}
