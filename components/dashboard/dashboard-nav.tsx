'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { SessionProvider, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  LogOut,
  ShoppingCart,
  Store,
  Users,
  Wallet,
  X,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  showBadge?: boolean;
}

interface DashboardNavProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  className?: string;
}

export function DashboardNav({ isOpen, setIsOpen, className }: DashboardNavProps) {
  const pathname = usePathname();
  const [localIsOpen, setLocalIsOpen] = useState(false);

  // Use props if provided, otherwise use local state
  const isMenuOpen = isOpen !== undefined ? isOpen : localIsOpen;
  const toggleMenu = setIsOpen || setLocalIsOpen;

  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: 'Purchases',
      href: '/purchases',
      icon: <ShoppingCart className="h-4 w-4" />,
    },
    {
      title: 'Sales',
      href: '/sales',
      icon: <Store className="h-4 w-4" />,
      showBadge: true,
    },
    {
      title: 'Payments',
      href: '/payments',
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      title: 'Customers',
      href: '/customers',
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: 'Suppliers',
      href: '/suppliers',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Navigation */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        "fixed md:relative top-0 left-0 z-40 h-full w-64 md:w-auto",
        "bg-white md:bg-transparent shadow-lg md:shadow-none", // Changed bg-background to bg-white
        "transform md:transform-none",
        isMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        className
      )}>
        <div className="flex justify-end p-4 md:hidden">
          <button
            className="p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => toggleMenu(false)}
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col space-y-1 p-4 md:p-0 pt-0">
          <div className="mb-4 px-4 font-medium text-xs uppercase tracking-wider text-muted-foreground">
            Main Navigation
          </div>
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={() => toggleMenu(false)}
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
            </Link>
          ))}

          {/* Logout Button - Mobile Only */}
          <div className="md:hidden mt-6 pt-6 border-t border-border">
            <button
              onClick={() => signOut()}
              className="w-full group flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-all hover:bg-accent/80 hover:text-accent-foreground text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center mr-2 text-muted-foreground group-hover:text-foreground">
                <LogOut className="h-4 w-4" />
              </span>
              <span>Log Out</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay for mobile when menu is open */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => toggleMenu(false)}
        />
      )}
    </>
  );
}

export function OtherDashboardNav({ isOpen, setIsOpen, className }: DashboardNavProps) {
  return (
      <SessionProvider>
        <DashboardNav isOpen={isOpen} setIsOpen={setIsOpen} className={className} />
      </SessionProvider>
  );
}