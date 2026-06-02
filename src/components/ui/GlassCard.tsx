"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "strong" | "light";
  glow?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function GlassCard({
  variant = "default",
  glow = false,
  children,
  className,
  ...props
}: GlassCardProps) {
  const glassClass =
    variant === "strong"
      ? "glass-strong"
      : variant === "light"
        ? "glass-light"
        : "glass";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl p-5",
        glassClass,
        glow && "glow-ring shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
