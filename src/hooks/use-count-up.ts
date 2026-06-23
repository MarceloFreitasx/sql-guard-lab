import { useEffect, useRef, useState } from "react";

type Options = {
  duration?: number;
  decimals?: number;
};

export function useCountUp(target: number, { duration = 1200, decimals = 0 }: Options = {}) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStarted(true);
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = target * eased;
      setValue(decimals > 0 ? Number(next.toFixed(decimals)) : Math.round(next));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration, decimals]);

  return { value, ref };
}

export function formatStatValue(
  value: number,
  opts: { prefix?: string; suffix?: string; grouping?: boolean; decimals?: number },
): string {
  const { prefix = "", suffix = "", grouping = false, decimals = 0 } = opts;
  const formatted = grouping
    ? value.toLocaleString("en-US", { maximumFractionDigits: decimals })
    : decimals > 0
      ? value.toFixed(decimals)
      : String(value);
  return `${prefix}${formatted}${suffix}`;
}
