"use client";

import { cn } from "@/lib/utils";

interface HamburgerIconProps {
  isOpen: boolean;
  className?: string;
}

export function HamburgerIcon({ isOpen, className }: HamburgerIconProps) {
  return (
    <div className={cn("w-5 h-5 flex flex-col justify-center items-center gap-[4px]", className)}>
      {/* Top line */}
      <span
        className={cn(
          "w-full h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out origin-center",
          isOpen && "rotate-45 translate-y-[6px]"
        )}
      />
      {/* Middle line */}
      <span
        className={cn(
          "w-full h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out",
          isOpen && "opacity-0 scale-0"
        )}
      />
      {/* Bottom line */}
      <span
        className={cn(
          "w-full h-[2px] bg-current rounded-full transition-all duration-300 ease-in-out origin-center",
          isOpen && "-rotate-45 -translate-y-[6px]"
        )}
      />
    </div>
  );
}
