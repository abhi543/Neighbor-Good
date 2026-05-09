'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Post, useAppStore } from '@/lib/store';
import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
import {
  Clock,
  MapPin,
  Flame,
  Flag,
  Wrench,
  CookingPot,
  HandHeart,
  Package,
  MessageCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import FlagDialog from './flag-dialog';

const categoryConfig: Record<string, { icon: typeof Wrench; label: string }> = {
  TOOLS: { icon: Wrench, label: 'Tools' },
  KITCHEN: { icon: CookingPot, label: 'Kitchen' },
  SERVICE: { icon: HandHeart, label: 'Service' },
  OTHER: { icon: Package, label: 'Other' },
};

interface PostDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
}

export default function PostDetailSheet({
  open,
  onOpenChange,
  post,
}: PostDetailSheetProps) {
  const { currentUser, posts, addExchange, setView, setCurrentChat } = useAppStore();
  const [isResponding, setIsResponding] = useState(false);
  const [showFlagDialog, setShowFlagDialog] = useState(false);

  if (!post) return null;

  const catConfig = categoryConfig[post.category] || categoryConfig.OTHER;
  const isMyPost = post.authorId === currentUser?.id;
  const isExpired = new Date(post.expiresAt) < new Date();

  const similarPosts = posts
    .filter(
      (p) =>
        p.id !== post.id &&
        p.status === 'ACTIVE' &&
        p.category === post.category &&
        p.type !== post.type
    )
    .slice(0, 3);

  const handleRespond = async () => {
    if (!currentUser || isMyPost) return;
    setIsResponding(true);

    try {
      const res = await fetch('/api/exchanges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          requesterId: currentUser.id,
        }),
      });

      if (res.ok) {
        const exchange = await res.json();
        addExchange(exchange);
        toast.success(
          post.type === 'ASK'
            ? 'Offer sent! The poster will see your response.'
            : 'Request sent! The poster will be notified.'
        );
        onOpenChange(false);
        setCurrentChat(exchange);
        setView('chat');
      }
    } catch {
      toast.error('Failed to send response. Please try again.');
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] sm:max-w-lg mx-auto rounded-t-2xl">
          <SheetHeader className="px-4 pt-2 pb-0">
            <SheetTitle className="sr-only">Post Details</SheetTitle>
            <SheetDescription className="sr-only">
              View post details and respond to this listing
            </SheetDescription>
          </SheetHeader>

          <div className="overflow-y-auto h-full pb-8 px-4 pt-2">
            {/* Close button */}
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Type & Category badges */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className={
                  post.type === 'OFFER'
                    ? 'bg-neighbor-green text-neighbor-green-foreground'
                    : 'bg-neighbor-coral text-neighbor-coral-foreground'
                }
              >
                {post.type === 'OFFER' ? 'GIVING' : 'NEEDING'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <catConfig.icon className="h-3 w-3" />
                {catConfig.label}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  Expired
                </Badge>
              )}
            </div>

            {/* Title */}
            <h2 className="text-xl font-bold text-foreground mb-2 leading-tight">
              {post.title}
            </h2>

            {/* Author */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                {post.author?.name?.charAt(0) || '?'}
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">
                  {post.author?.name}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-neighbor-amber" />
                  <span>{post.author?.warmthScore || 0} warmth</span>
                  <span className="mx-1">·</span>
                  <span>
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {post.description}
                </p>
              </div>
            )}

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-[11px] text-muted-foreground">Expires</p>
                  <p className="text-xs font-medium text-foreground">
                    {formatDistanceToNowStrict(new Date(post.expiresAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
              {post.lat && post.lng && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-[11px] text-muted-foreground">Location</p>
                    <p className="text-xs font-medium text-foreground">
                      {post.author?.unitNumber
                        ? `Unit ${post.author.unitNumber}`
                        : 'Nearby'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              {!isMyPost && (
                <Button
                  onClick={handleRespond}
                  disabled={isResponding || isExpired}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {isResponding
                    ? 'Sending...'
                    : post.type === 'ASK'
                    ? 'I Can Help!'
                    : 'I Need This!'}
                </Button>
              )}
              {!isMyPost && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFlagDialog(true)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Similar posts */}
            {similarPosts.length > 0 && (
              <>
                <Separator className="mb-4" />
                <h3 className="font-semibold text-sm text-foreground mb-3">
                  Similar {post.type === 'OFFER' ? 'requests' : 'offers'} nearby
                </h3>
                <div className="space-y-2">
                  {similarPosts.map((sp) => {
                    const spCat = categoryConfig[sp.category] || categoryConfig.OTHER;
                    return (
                      <Card
                        key={sp.id}
                        className="cursor-pointer hover:shadow-sm transition-shadow border-border"
                        onClick={() => {
                          onOpenChange(false);
                          // We'll re-open with the new post
                          setTimeout(() => {
                            // Trigger parent to open new post
                            window.dispatchEvent(
                              new CustomEvent('openPost', { detail: sp })
                            );
                          }, 300);
                        }}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <spCat.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {sp.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sp.author?.name}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] shrink-0"
                          >
                            {sp.type === 'OFFER' ? 'GIVE' : 'NEED'}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <FlagDialog
        open={showFlagDialog}
        onOpenChange={setShowFlagDialog}
        targetId={post.authorId}
        targetName={post.author?.name || 'Unknown'}
      />
    </>
  );
}
