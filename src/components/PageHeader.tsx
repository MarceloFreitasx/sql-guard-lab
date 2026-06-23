import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  align?: "left" | "center";
};

export function PageHeader({
  kicker,
  title,
  description,
  actions,
  align = "left",
}: PageHeaderProps) {
  const centered = align === "center";

  return (
    <header
      className={`flex flex-col gap-4 ${centered ? "items-center text-center" : "items-start"} ${actions ? "md:flex-row md:items-end md:justify-between" : ""}`}
    >
      <div className={centered ? "max-w-2xl" : "min-w-0 flex-1"}>
        {kicker && <p className="section-kicker">{kicker}</p>}
        <h1
          className={`font-semibold tracking-tight text-foreground ${kicker ? "mt-2" : ""} ${centered ? "text-4xl md:text-5xl" : "font-mono text-3xl md:text-4xl"}`}
        >
          {title}
        </h1>
        {description && (
          <p
            className={`mt-2 text-sm leading-relaxed text-muted-foreground md:text-base ${centered ? "mx-auto" : "max-w-2xl"}`}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
