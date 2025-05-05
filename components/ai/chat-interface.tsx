'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles, Bot } from 'lucide-react';
import { ChatMessage } from '@/components/ai/chat-message';

interface ChatInterfaceProps {
  onClose?: () => void;
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

    // Simulate AI response
    setTimeout(() => {
      const examples = [
        "I found 3 ruby purchases over 50 carats in the last quarter. The largest was 87.5 carats purchased from Bangkok Gems Ltd for $245,000.",
        "The customer Raj Patel has an outstanding balance of ₹875,000 from the emerald necklace purchase on March 15th. Payment is due in 7 days.",
        "Your top-selling item this month is the 18k gold diamond tennis bracelet with 5 sales totaling $42,500. Would you like to see the customer breakdown?",
        "I've analyzed your inventory and found 12 items with low stock that you might want to reorder soon. Should I prepare a purchase recommendation?",
        "Based on your sales history, May-July is your peak season for sapphire sales. Would you like me to prepare a seasonal inventory report?"
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
      <ScrollArea className="flex-1 p-4 pr-2" ref={scrollAreaRef}>
        <div className="space-y-6 mb-4 max-w-full">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-muted-foreground bg-muted/50 w-fit max-w-[80%] rounded-2xl rounded-bl-none px-4 py-2 shadow-sm">
              <Bot className="h-5 w-5 text-primary" />
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
        <div className="flex gap-2 items-center">
          <Input
            ref={inputRef}
            placeholder="Ask a question about your business..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 border-muted bg-background"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-secondary" />
          Try: "Show me ruby purchases over 50 carats" or "Which customers still owe me money?"
        </p>
      </div>
    </div>
  );
}