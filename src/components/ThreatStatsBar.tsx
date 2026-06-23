import { ExternalLink } from "lucide-react";
import { THREAT_STATS, THREAT_STATS_FOOTNOTE, type ThreatStat } from "../lib/threat-stats";
import { formatStatValue, useCountUp } from "../hooks/use-count-up";
import { Reveal } from "./Reveal";

type Props = {
  /** When true, renders as a full-bleed band below the hero. */
  fullWidth?: boolean;
};

export function ThreatStatsBar({ fullWidth = false }: Props) {
  if (fullWidth) {
    return (
      <Reveal y={12}>
        <section
          aria-labelledby="threat-landscape-heading"
          className="border-y border-[color:var(--bg-border)] bg-[color:var(--bg-card)]/60"
        >
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
          <p id="threat-landscape-heading" className="section-kicker">
            Threat landscape
          </p>
          <dl className="mt-5 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4 lg:gap-y-0">
            {THREAT_STATS.map((stat, index) => (
              <AnimatedStatItem key={stat.label} stat={stat} padded index={index} />
            ))}
          </dl>
          <p className="mt-6 text-center text-[11px] leading-relaxed text-muted-foreground md:text-left">
            {THREAT_STATS_FOOTNOTE}
          </p>
        </div>
        </section>
      </Reveal>
    );
  }

  return (
    <Reveal>
      <div className="mt-10 border-t border-[color:var(--bg-border)] pt-8">
        <p className="section-kicker">Threat landscape</p>
        <dl className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {THREAT_STATS.map((stat) => (
          <AnimatedStatItem key={stat.label} stat={stat} />
        ))}
      </dl>
      <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
        {THREAT_STATS_FOOTNOTE}
      </p>
      </div>
    </Reveal>
  );
}

function AnimatedStatItem({
  stat,
  padded = false,
  index = 0,
}: {
  stat: ThreatStat;
  padded?: boolean;
  index?: number;
}) {
  const { value, ref } = useCountUp(stat.animateTo, {
    decimals: stat.animateDecimals ?? 0,
  });

  const display = formatStatValue(value, {
    prefix: stat.animatePrefix,
    suffix: stat.animateSuffix,
    grouping: stat.animateGrouping,
    decimals: stat.animateDecimals,
  });

  const dividerClass = padded
    ? [
        "min-w-0",
        index === 1 || index === 3
          ? "sm:border-l sm:border-[color:var(--bg-border)] sm:pl-8"
          : "",
        index > 0 ? "lg:border-l lg:border-[color:var(--bg-border)] lg:pl-8" : "",
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <div ref={ref} className={dividerClass || undefined}>
      <dt className="font-mono text-3xl font-semibold tracking-tight text-foreground tabular-nums whitespace-nowrap md:text-4xl">
        {display}
      </dt>
      <dd className="mt-2 text-sm font-medium text-foreground">{stat.label}</dd>
      <dd className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{stat.detail}</dd>
      <dd className="mt-2.5">
        <a
          href={stat.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-[color:var(--cyan-neon)]/80 transition-colors duration-200 hover:text-[color:var(--cyan-neon)] hover:underline"
        >
          {stat.source}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
        </a>
      </dd>
    </div>
  );
}
