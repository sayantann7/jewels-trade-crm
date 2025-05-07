import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  className?: string;
}

export function Loading({
  text = "Loading",
  size = "md",
  fullScreen = false,
  className,
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        fullScreen ? "fixed inset-0 bg-background z-50" : "py-16",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Loader2
            className={cn(
              "animate-spin text-primary",
              sizeClasses[size]
            )}
          />
          <div className="absolute inset-0 animate-pulse opacity-30 blur-sm">
            <Loader2
              className={cn(
                "text-primary",
                sizeClasses[size]
              )}
            />
          </div>
        </div>
        <div className="animate-pulse">
          <p className="text-sm font-medium text-muted-foreground">
            {text}
            <span className="animate-ellipsis">...</span>
          </p>
        </div>
      </div>
    </div>
  );
}