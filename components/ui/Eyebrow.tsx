interface Props {
  children: React.ReactNode;
  /** крупный вариант (используется в блоке «Предметы и курсы») */
  large?: boolean;
  className?: string;
}

export function Eyebrow({ children, large = false, className = "" }: Props) {
  return (
    <div className={`flex w-full items-center gap-2.5 ${className}`}>
      <span className="h-px w-[18px] shrink-0 bg-accent shadow-[0_0_15px_rgb(230_57_70/0.5)]" />
      <span
        className={`glow-red font-bold uppercase text-accent ${
          large
            ? "text-[15.5px] tracking-[2.17px]"
            : "text-xs tracking-[1.68px]"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
