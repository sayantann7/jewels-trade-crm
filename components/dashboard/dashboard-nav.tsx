'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Store, 
  Clock, 
  Wallet, 
  BarChart, 
  Settings,
  GemIcon, 
  Users,
  Briefcase
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

export function DashboardNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Purchases',
      href: '/purchases',
      icon: <ShoppingCart className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Sales',
      href: '/sales',
      icon: <Store className="mr-2 h-4 w-4" />,
      showBadge: true,
    },
    {
      title: 'Customers',
      href: '/customers',
      icon: <Users className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Transactions',
      href: '/transactions',
      icon: <Wallet className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      <div className="mb-4 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
        Main Navigation
      </div>
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            'group flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent/80 hover:text-accent-foreground',
            pathname === item.href
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className={cn(
            "flex items-center mr-2",
            pathname === item.href ? 'text-accent-foreground' : 'text-muted-foreground group-hover:text-foreground'
          )}>
            {item.icon}
          </span>
          <span>{item.title}</span>
          {item.showBadge && (
            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              2
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}