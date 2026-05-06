import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 1024;

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.innerWidth < DESKTOP_BREAKPOINT;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${DESKTOP_BREAKPOINT - 1}px)`);

    const handleScreenResize = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleScreenResize);

    return () => {
      mediaQuery.removeEventListener("change", handleScreenResize);
    };
  }, []);

  return isMobile;
};
