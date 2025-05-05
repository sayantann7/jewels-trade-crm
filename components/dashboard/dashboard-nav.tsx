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
  Settings 
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
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
    },
    {
      title: 'Payment Schedules',
      href: '/payment-schedules',
      icon: <Clock className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Transactions',
      href: '/transactions',
      icon: <Wallet className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Reports',
      href: '/reports',
      icon: <BarChart className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ];

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            'group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
            pathname === item.href
              ? 'bg-accent text-accent-foreground'
              : 'transparent'
          )}
        >
          {item.icon}
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}