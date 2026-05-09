'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, Exchange, Message } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import {
  MessageCircle,
  Send,
  ChevronLeft,
  CheckCircle,
  ThumbsUp,
  Award,
  Clock,
  X,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-neighbor-amber text-neighbor-amber-foreground' },
  ACCEPTED: { label: 'Accepted', color: 'bg-neighbor-green text-neighbor-green-foreground' },
  COMPLETED: { label: 'Completed', color: 'bg-muted text-muted-foreground' },
  CANCELLED: { label: 'Cancelled', color: 'bg-destructive text-white' },
};

function ExchangeList({ onSelectExchange }: { onSelectExchange: (e: Exchange) => void }) {
  const { exchanges, currentUser } = useAppStore();

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3.5rem)] md:ml-16 flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <h2 className="text-lg font-bold text-foreground">Messages</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {exchanges.length} conversation{exchanges.length !== 1 ? 's' : ''}
        </p>
      </div>

      <ScrollArea className="flex-1 px-4 pb-20">
        {exchanges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-medium">No messages yet</p>
            <p className="text-sm mt-1">
              Respond to a post to start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {exchanges.map((exchange, index) => {
              const isRequester = exchange.requesterId === currentUser?.id;
              const otherPerson = isRequester ? exchange.owner : exchange.requester;
              const lastMessage =
                exchange.messages && exchange.messages.length > 0
                  ? exchange.messages[exchange.messages.length - 1]
                  : null;
              const status = statusConfig[exchange.status] || statusConfig.PENDING;

              return (
                <motion.div
                  key={exchange.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border"
                    onClick={() => onSelectExchange(exchange)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm shrink-0">
                          {otherPerson?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {otherPerson?.name || 'Unknown'}
                            </span>
                            <Badge className={cn('text-[10px] px-1.5 py-0', status.color)}>
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-foreground/60 truncate mb-0.5">
                            {exchange.post?.title || 'Exchange'}
                          </p>
                          {lastMessage && (
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground truncate flex-1">
                                {lastMessage.isSystem
                                  ? '🏠 ' + lastMessage.content
                                  : lastMessage.content}
                              </p>
                              <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                {formatDistanceToNow(new Date(lastMessage.createdAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function ChatScreen({
  exchange,
  onBack,
}: {
  exchange: Exchange;
  onBack: () => void;
}) {
  const { currentUser, updateExchange } = useAppStore();
  const [messages, setMessages] = useState<Message[]>(exchange.messages || []);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showRating, setShowRating] = useState(exchange.status === 'COMPLETED' && !exchange.rating);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRequester = exchange.requesterId === currentUser?.id;
  const otherPerson = isRequester ? exchange.owner : exchange.requester;
  const canAccept = !isRequester && exchange.status === 'PENDING';
  const canComplete =
    exchange.status === 'ACCEPTED' &&
    ((isRequester && exchange.requesterId === currentUser?.id) ||
      (!isRequester && exchange.ownerId === currentUser?.id));

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {
      // Silent fail
    }
  }, [exchange.id]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUser) return;
    setIsSending(true);

    try {
      const res = await fetch(`/api/exchanges/${exchange.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage('');
      }
    } catch {
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });

      if (res.ok) {
        const updated = await res.json();
        updateExchange(exchange.id, { status: 'ACCEPTED', ...updated });
        toast.success('Exchange accepted! 🤝');

        // Send system message
        await fetch(`/api/exchanges/${exchange.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderId: currentUser?.id,
            content: `Meet in the lobby for your first exchange! 🤝\nUnit: ${otherPerson?.unitNumber || 'TBD'}`,
            isSystem: true,
          }),
        });
        fetchMessages();
      }
    } catch {
      toast.error('Failed to accept exchange');
    }
  };

  const handleComplete = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });

      if (res.ok) {
        const updated = await res.json();
        updateExchange(exchange.id, { status: 'COMPLETED', ...updated });
        setShowRating(true);
        toast.success('Exchange completed! Great neighborly work! 🎉');
      }
    } catch {
      toast.error('Failed to complete exchange');
    }
  };

  const handleRate = async (rating: number) => {
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (res.ok) {
        updateExchange(exchange.id, { rating });
        setShowRating(false);
        toast.success(
          rating === 1
            ? 'Thanks for the feedback! Warmth score updated! ⭐'
            : 'Feedback noted. We hope the next exchange is better.'
        );
      }
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  const handleBadge = async () => {
    try {
      const res = await fetch(`/api/exchanges/${exchange.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeGiven: true }),
      });

      if (res.ok) {
        updateExchange(exchange.id, { badgeGiven: true });
        toast.success('Good Neighbor badge awarded! 🏅');
      }
    } catch {
      toast.error('Failed to award badge');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3.5rem)] md:ml-16 flex flex-col">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
          {otherPerson?.name?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {otherPerson?.name || 'Unknown'}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {exchange.post?.title}
          </p>
        </div>
        <Badge
          className={cn(
            'text-[10px] px-1.5 py-0',
            statusConfig[exchange.status]?.color
          )}
        >
          {statusConfig[exchange.status]?.label}
        </Badge>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', isMine ? 'justify-end' : 'justify-start')}
            >
              {msg.isSystem ? (
                <div className="w-full text-center">
                  <div className="inline-block bg-muted/50 rounded-lg px-3 py-2 max-w-[85%]">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-4 py-2.5',
                    isMine
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-card border border-border rounded-bl-md'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      isMine
                        ? 'text-primary-foreground/60'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatDistanceToNow(new Date(msg.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Rating Overlay */}
      <AnimatePresence>
        {showRating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mx-4 mb-3 p-4 bg-neighbor-amber/10 border border-neighbor-amber/20 rounded-xl"
          >
            <p className="text-sm font-medium text-foreground mb-3">
              How was your exchange with {otherPerson?.name}?
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRate(1)}
                className="flex-1 gap-2"
              >
                <ThumbsUp className="h-4 w-4 text-neighbor-green" />
                Good Experience
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRate(0)}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4 text-muted-foreground" />
                Not Great
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="px-4 pb-2 flex gap-2">
        {canAccept && (
          <Button
            onClick={handleAccept}
            className="flex-1 bg-neighbor-green hover:bg-neighbor-green/90 text-neighbor-green-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Accept Exchange
          </Button>
        )}
        {canComplete && (
          <Button
            onClick={handleComplete}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark Complete
          </Button>
        )}
        {exchange.status === 'COMPLETED' && !exchange.badgeGiven && exchange.rating === 1 && (
          <Button
            variant="outline"
            onClick={handleBadge}
            className="flex-1 border-neighbor-amber text-neighbor-amber hover:bg-neighbor-amber/10"
          >
            <Award className="h-4 w-4 mr-2" />
            Give Good Neighbor Badge
          </Button>
        )}
      </div>

      {/* Input */}
      {exchange.status !== 'COMPLETED' && exchange.status !== 'CANCELLED' && (
        <div className="px-4 pb-20 pt-2 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              className="bg-card border-border flex-1"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isSending || !newMessage.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChatView() {
  const { currentChat, setCurrentChat } = useAppStore();

  if (currentChat) {
    return (
      <ChatScreen
        exchange={currentChat}
        onBack={() => setCurrentChat(null)}
      />
    );
  }

  return <ExchangeList onSelectExchange={(e) => setCurrentChat(e)} />;
}
