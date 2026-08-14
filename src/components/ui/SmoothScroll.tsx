import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: true,
      lerp: 0.085,
      syncTouch: false,
    });

    return () => lenis.destroy();
  }, []);

  return <>{children}</>;
}
