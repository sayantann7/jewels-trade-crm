'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ChatInterface } from '@/components/ai/chat-interface';

export function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageSquare className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Open chat</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>Gem Trade Assistant</SheetTitle>
        </SheetHeader>
        <ChatInterface onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}