import type { ComponentProps } from "react";

export function SectionTitle({
  className = "",
  ...rest
}: ComponentProps<"h2">) {
  return (
    <h2
      className={`glow-blue text-[32px] font-bold tracking-[-0.32px] text-blue ${className}`}
      {...rest}
    />
  );
}
