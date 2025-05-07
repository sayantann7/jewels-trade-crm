"use client";

import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { Logo } from '@/components/ui/logo';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { SessionProvider, signOut } from "next-auth/react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background to-background/95">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm w-full px-5">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="relative sparkle">
              <Logo className="h-7 w-7 text-primary" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Gem Trade <span className="text-primary">CRM</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={() => setIsNavOpen(!isNavOpen)}
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <button className="hidden md:block" onClick={() => signOut()}>Log Out</button>
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[220px_1fr]">
        <aside className="hidden w-[220px] flex-col pt-6 md:flex">
          <DashboardNav />
        </aside>
        <DashboardNav isOpen={isNavOpen} setIsOpen={setIsNavOpen} className="md:hidden" />
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-8 p-8 pt-6">
            {children}
          </div>
        </main>
      </div>
      <footer className="border-t bg-muted/40 py-4">
        <div className="container flex items-center justify-between text-sm text-muted-foreground px-5">
          <div>© 2025 Gem Trade CRM</div>
        </div>
      </footer>
    </div>
  );
}