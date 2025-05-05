'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { ChatMessage } from '@/components/ai/chat-message';

interface ChatInterfaceProps {
  onClose: () => void;
}

type MessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Gem Trade Assistant. Ask me anything about your inventory, sales, or purchases.',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: MessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response after delay
    setTimeout(() => {
      const examples = [
        'According to your records, you have purchased 85 carats of rubies in the last quarter, with a total value of ₹4,25,000.',
        'There are 3 customers who still owe more than ₹75,000: Luxury Jewels (₹1,15,000), Royal Jewelry (₹92,000), and Elite Gems (₹85,000).',
        'Your largest purchase this month was 45 carats of diamonds from Diamond Traders for ₹4,75,000.',
        'You have 5 payments due in the next week, totaling ₹3,65,000.',
        'Based on your data, emerald sales have increased by 28% compared to last month.',
      ];

      const assistantMessage: MessageType = {
        id: Date.now().toString(),
        role: 'assistant',
        content: examples[Math.floor(Math.random() * examples.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse delay-150"></div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            placeholder="Ask a question about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "Show me ruby purchases over 50 carats" or "Which customers still owe me money?"
        </p>
      </div>
    </div>
  );
}