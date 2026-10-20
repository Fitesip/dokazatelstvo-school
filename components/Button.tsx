import Link from "next/link";
import type { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;
type Size = "md" | "sm";

const SIZES: Record<Size, string> = {
  md: "px-[22px] py-3 text-[15px]",
  sm: "px-4 py-[9px] text-[14px]",
};

const PRIMARY =
  "inline-flex h-fit items-center justify-center whitespace-nowrap rounded-[3px] border border-ink/0 bg-accent font-bold text-ink drop-shadow-[0_0_7.5px_rgb(230_57_70/0.5)] transition hover:brightness-110";

export function PrimaryButton({
  className = "",
  size = "md",
  ...rest
}: LinkProps & { size?: Size }) {
  return (
    <Link className={`${PRIMARY} ${SIZES[size]} ${className}`} {...rest} />
  );
}

/** Та же красная кнопка, но настоящий <button> — для форм */
export function PrimarySubmit({
  className = "",
  size = "md",
  ...rest
}: ComponentProps<"button"> & { size?: Size }) {
  return (
    <button
      className={`${PRIMARY} cursor-pointer disabled:cursor-default disabled:opacity-60 ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
}

export function OutlineButton({
  className = "",
  size = "md",
  ...rest
}: LinkProps & { size?: Size }) {
  return (
    <Link
      className={`glow-blue inline-flex h-fit items-center justify-center whitespace-nowrap rounded-[3px] border border-line font-bold text-blue transition hover:border-blue ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
}

export function LinkButton({ className = "", ...rest }: LinkProps) {
  return (
    <Link
      className={`glow-blue inline-flex border-b border-accent pb-0.5 text-[15px] font-bold text-blue transition hover:brightness-125 ${className}`}
      {...rest}
    />
  );
}
