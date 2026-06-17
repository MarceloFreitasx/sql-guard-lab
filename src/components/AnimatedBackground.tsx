import { useEffect, useState } from "react";

type Bit = { id: number; left: number; delay: number; duration: number; char: string };

export function AnimatedBackground() {
  const [bits, setBits] = useState<Bit[]>([]);

  useEffect(() => {
    const arr: Bit[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
      char: Math.random() > 0.5 ? "1" : "0",
    }));
    setBits(arr);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1117]" />
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute top-[-20px] font-mono text-xs text-[color:var(--cyan-neon)]/30"
          style={{
            left: `${b.left}%`,
            animation: `float ${b.duration}s ease-in-out ${b.delay}s infinite, gridMove ${b.duration * 2}s linear infinite`,
          }}
        >
          {b.char}
        </span>
      ))}
    </div>
  );
}
