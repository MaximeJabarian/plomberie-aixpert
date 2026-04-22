import { type ElementType, type ReactNode, type CSSProperties } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

type Direction = "up" | "left" | "right" | "scale";

interface RevealProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  direction?: Direction;
  delay?: number;
  style?: CSSProperties;
}

const dirClass: Record<Direction, string> = {
  up: "",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
};

export function Reveal({
  as: Tag = "div",
  children,
  className,
  direction = "up",
  delay = 0,
  style,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", dirClass[direction], visible && "in-view", className)}
      style={{ ...style, ["--reveal-delay" as never]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
