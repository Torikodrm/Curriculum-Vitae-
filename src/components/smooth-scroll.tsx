"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, anchors: true });
    const update = () => ScrollTrigger.update();
    const frame = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", update);
    gsap.ticker.add(frame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(frame);
      lenis.destroy();
    };
  }, []);

  return children;
}
