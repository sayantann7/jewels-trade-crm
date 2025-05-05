'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Gem, User } from 'lucide-react';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <div
      className={cn(
        'flex items-start gap-3 text-sm',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      <Avatar className={cn('h-8 w-8', isUser ? 'bg-primary' : 'bg-muted')}>
        <AvatarFallback>
          {isUser ? <User className="h-4 w-4" /> : <Gem className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>
      <Card className={cn(isUser ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <p className="leading-relaxed">{message.content}</p>
            <p className="text-xs opacity-50">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}