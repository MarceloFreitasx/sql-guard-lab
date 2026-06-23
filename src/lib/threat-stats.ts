export type ThreatStat = {
  value: string;
  label: string;
  detail: string;
  source: string;
  sourceUrl: string;
  animateTo: number;
  animatePrefix?: string;
  animateSuffix?: string;
  animateDecimals?: number;
  animateGrouping?: boolean;
};

/** Verified figures from public security research — update when new reports ship. */
export const THREAT_STATS: ThreatStat[] = [
  {
    value: "14,137+",
    animateTo: 14137,
    animateSuffix: "+",
    animateGrouping: true,
    label: "SQL injection CVEs catalogued",
    detail: "Public vulnerability records mapped to CWE-89 in the NIST National Vulnerability Database.",
    source: "NIST NVD — CWE-89",
    sourceUrl: "https://nvd.nist.gov/vuln/search/results?cwe_id=CWE-89",
  },
  {
    value: "10%",
    animateTo: 10,
    animateSuffix: "%",
    label: "Production vulns that are SQLi",
    detail:
      "In 2024, roughly one in ten vulnerabilities found in closed-source applications were SQL injection flaws.",
    source: "Aikido Security — State of SQL Injections (2024)",
    sourceUrl: "https://dev.to/aikidosecurity/the-state-of-sql-injections-44n3",
  },
  {
    value: "~39s",
    animateTo: 39,
    animatePrefix: "~",
    animateSuffix: "s",
    label: "Between attack attempts",
    detail:
      "University of Maryland research, widely cited in 2024–2025 industry reports: a cyberattack attempt occurs about every 39 seconds worldwide.",
    source: "University of Maryland (via industry reports)",
    sourceUrl: "https://www.umd.edu/",
  },
  {
    value: "2.1M",
    animateTo: 2.1,
    animateSuffix: "M",
    animateDecimals: 1,
    label: "Automated scans per minute",
    detail:
      "FortiGuard Labs logged ~36,000 reconnaissance scans per second worldwide in 2024 — probing exposed services before exploits land.",
    source: "Fortinet Global Threat Landscape Report 2025",
    sourceUrl: "https://www.fortinet.com/resources/reports/threat-landscape-report",
  },
];

export const THREAT_STATS_FOOTNOTE =
  "All figures from published research (2024–2025). Scan and attack-attempt volumes include automated reconnaissance, not only SQL injection.";
