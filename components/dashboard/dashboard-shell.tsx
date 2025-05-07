"use client";

import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { Logo } from '@/components/ui/logo';
// import { ChatButton } from '@/components/ai/chat-button';
import { SessionProvider, signOut } from "next-auth/react";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
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
            {/* <ChatButton /> */}
            <button onClick={() => signOut()} >Log Out</button>
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[220px_1fr]">
        <aside className="hidden w-[220px] flex-col pt-6 md:flex">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          <div className="flex-1 space-y-8 p-8 pt-6">
            {children}
          </div>
        </main>
      </div>
      <footer className="border-t bg-muted/40 py-4">
        <div className="container flex items-center justify-between text-sm text-muted-foreground px-5">
          <div>© 2025 Gem Trade CRM</div>
          {/* <div className="flex items-center gap-4">
            <a href="#" className="hover:text-primary hover:underline">Terms</a>
            <a href="#" className="hover:text-primary hover:underline">Privacy</a>
            <a href="#" className="hover:text-primary hover:underline">Help</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}

export function OtherDashboardShell({ children }: DashboardShellProps) {
  return (
    <SessionProvider>
      <DashboardShell>
        {children}
      </DashboardShell>
    </SessionProvider>
  );
}