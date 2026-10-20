import type { ComponentProps } from "react";

export function Container({ className = "", ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-[1180px] px-4 sm:px-8 ${className}`}
      {...rest}
    />
  );
}
