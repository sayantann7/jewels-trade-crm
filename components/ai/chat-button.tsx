'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChatInterface } from '@/components/ai/chat-interface';

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageSquare className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg border-l border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-secondary" />
            <span>Gem Trade Assistant</span>
          </SheetTitle>
        </SheetHeader>
        <ChatInterface onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}