import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  text,
  children,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-2 mb-6", className)}>
      <div className="grid gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight text-foreground line-clamp-1">{heading}</h1>
        {text && (
          <p className="text-muted-foreground text-sm md:text-base max-w-[750px]">
            {text}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}