'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import {
  Flame,
  ArrowUpCircle,
  ArrowDownCircle,
  Award,
  Wrench,
  CookingPot,
  HandHeart,
  Package,
  Edit3,
  MessageCircle,
  CheckCircle,
  Clock,
  Pencil,
  X,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Post } from '@/lib/store';

const categoryConfig: Record<string, { icon: typeof Wrench; label: string }> = {
  TOOLS: { icon: Wrench, label: 'Tools' },
  KITCHEN: { icon: CookingPot, label: 'Kitchen' },
  SERVICE: { icon: HandHeart, label: 'Service' },
  OTHER: { icon: Package, label: 'Other' },
};

export default function ProfileView() {
  const { currentUser, setUser, posts, exchanges } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const myPosts = posts.filter((p) => p.authorId === currentUser?.id);
  const myExchanges = exchanges.filter(
    (e) =>
      e.requesterId === currentUser?.id || e.ownerId === currentUser?.id
  );
  const completedExchanges = myExchanges.filter(
    (e) => e.status === 'COMPLETED'
  );

  const totalGave = (currentUser?.gaveCount || 0) + myPosts.filter((p) => p.type === 'OFFER').length;
  const totalReceived = currentUser?.receivedCount || 0;

  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim() || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser({ ...currentUser, ...updated });
        toast.success('Profile updated! ✨');
        setIsEditing(false);
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const badges = [
    {
      label: 'Good Neighbor',
      icon: Award,
      earned: completedExchanges.some((e) => e.badgeGiven),
      color: 'text-neighbor-amber',
    },
    {
      label: 'Giver',
      icon: ArrowUpCircle,
      earned: totalGave >= 3,
      color: 'text-neighbor-green',
    },
    {
      label: 'Warm Heart',
      icon: Flame,
      earned: (currentUser?.warmthScore || 0) >= 10,
      color: 'text-neighbor-coral',
    },
    {
      label: 'Active',
      icon: MessageCircle,
      earned: myExchanges.length >= 3,
      color: 'text-primary',
    },
  ];

  if (!currentUser) return null;

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3.5rem)] md:ml-16">
      <ScrollArea className="h-full pb-24">
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          {/* Profile Header */}
          <Card className="border-border overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-neighbor-green/30 via-neighbor-amber/30 to-neighbor-coral/30" />
            <CardContent className="p-4 -mt-10">
              <div className="flex items-end justify-between mb-4">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold border-4 border-card shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="gap-1"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-background h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bio</Label>
                    <Textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={3}
                      className="bg-background"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {currentUser.name}
                  </h2>
                  {currentUser.unitNumber && (
                    <p className="text-sm text-muted-foreground">
                      Unit {currentUser.unitNumber}
                    </p>
                  )}
                  {currentUser.bio && (
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      {currentUser.bio}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="h-4 w-4 text-neighbor-amber" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {currentUser.warmthScore}
                </p>
                <p className="text-[11px] text-muted-foreground">Warmth</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowUpCircle className="h-4 w-4 text-neighbor-green" />
                </div>
                <p className="text-2xl font-bold text-foreground">{totalGave}</p>
                <p className="text-[11px] text-muted-foreground">Given</p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardContent className="p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ArrowDownCircle className="h-4 w-4 text-neighbor-coral" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {totalReceived}
                </p>
                <p className="text-[11px] text-muted-foreground">Received</p>
              </CardContent>
            </Card>
          </div>

          {/* Badges */}
          <Card className="border-border">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm text-foreground mb-3">
                Badges
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.label}
                    className={cn(
                      'flex items-center gap-2 p-2.5 rounded-lg border transition-all',
                      badge.earned
                        ? 'bg-background border-border'
                        : 'bg-muted/30 border-muted opacity-40'
                    )}
                  >
                    <badge.icon
                      className={cn(
                        'h-5 w-5',
                        badge.earned ? badge.color : 'text-muted-foreground'
                      )}
                    />
                    <span className="text-xs font-medium text-foreground">
                      {badge.label}
                    </span>
                    {badge.earned && (
                      <CheckCircle className="h-3 w-3 text-neighbor-green ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Posts */}
          {myPosts.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3">
                  My Posts ({myPosts.length})
                </h3>
                <div className="space-y-2">
                  {myPosts.map((post) => {
                    const cat = categoryConfig[post.category] || categoryConfig.OTHER;
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <cat.icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {post.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              className={cn(
                                'text-[10px] px-1.5 py-0',
                                post.type === 'OFFER'
                                  ? 'bg-neighbor-green text-neighbor-green-foreground'
                                  : 'bg-neighbor-coral text-neighbor-coral-foreground'
                              )}
                            >
                              {post.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exchange History */}
          {myExchanges.length > 0 && (
            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="font-semibold text-sm text-foreground mb-3">
                  Exchange History ({myExchanges.length})
                </h3>
                <div className="space-y-2">
                  {myExchanges.map((exchange) => {
                    const isRequester =
                      exchange.requesterId === currentUser.id;
                    const otherPerson = isRequester
                      ? exchange.owner
                      : exchange.requester;
                    const statusColors: Record<string, string> = {
                      PENDING: 'text-neighbor-amber',
                      ACCEPTED: 'text-neighbor-green',
                      COMPLETED: 'text-muted-foreground',
                      CANCELLED: 'text-destructive',
                    };
                    return (
                      <div
                        key={exchange.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                          {otherPerson?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {exchange.post?.title || 'Exchange'}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            with {otherPerson?.name}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] capitalize',
                            statusColors[exchange.status] || 'text-muted-foreground'
                          )}
                        >
                          {exchange.status.toLowerCase()}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
