'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAppStore } from '@/lib/store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Wrench,
  CookingPot,
  HandHeart,
  Package,
  Clock,
  Eye,
  Sparkles,
} from 'lucide-react';

const categories = [
  { value: 'TOOLS', icon: Wrench, label: 'Tools', color: 'bg-neighbor-amber/10 text-neighbor-amber border-neighbor-amber/30' },
  { value: 'KITCHEN', icon: CookingPot, label: 'Kitchen', color: 'bg-neighbor-coral/10 text-neighbor-coral border-neighbor-coral/30' },
  { value: 'SERVICE', icon: HandHeart, label: 'Service', color: 'bg-neighbor-green/10 text-neighbor-green border-neighbor-green/30' },
  { value: 'OTHER', icon: Package, label: 'Other', color: 'bg-muted/50 text-muted-foreground border-muted' },
];

const expirationOptions = [
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
  { value: 72, label: '72 hours' },
];

interface CreatePostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const { currentUser, addPost, setView } = useAppStore();
  const [type, setType] = useState<'OFFER' | 'ASK'>('OFFER');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [expiration, setExpiration] = useState(48);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const expiresAt = new Date(Date.now() + expiration * 60 * 60 * 1000);

  const resetForm = () => {
    setType('OFFER');
    setTitle('');
    setCategory('');
    setDescription('');
    setExpiration(48);
    setShowPreview(false);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }
    if (!category) {
      toast.error('Please choose a category');
      return;
    }
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          lat: currentUser.lat || 40.7128,
          lng: currentUser.lng || -74.006,
          expiresAt: expiresAt.toISOString(),
          authorId: currentUser.id,
        }),
      });

      if (res.ok) {
        const post = await res.json();
        addPost(post);
        toast.success(
          type === 'OFFER'
            ? 'Your offer is live! Neighbors will see it on the map. 🎉'
            : 'Your request is live! Someone nearby might be able to help. 🤞'
        );
        resetForm();
        onOpenChange(false);
        setView('map');
      }
    } catch {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.value === category);

  return (
    <Sheet open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <SheetContent side="bottom" className="h-[90vh] sm:max-w-lg mx-auto rounded-t-2xl">
        <SheetHeader className="px-4 pt-2 pb-0">
          <SheetTitle className="text-lg font-bold text-foreground">
            Create a Post
          </SheetTitle>
          <SheetDescription className="sr-only">
            Share what you have or ask for what you need
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto h-full pb-8 px-4 pt-4 space-y-5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setType('OFFER')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                type === 'OFFER'
                  ? 'border-neighbor-green bg-neighbor-green/10 shadow-sm'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  type === 'OFFER'
                    ? 'bg-neighbor-green text-neighbor-green-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <Sparkles className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'font-semibold text-sm',
                  type === 'OFFER' ? 'text-neighbor-green' : 'text-muted-foreground'
                )}
              >
                I&apos;m Giving
              </span>
            </button>
            <button
              onClick={() => setType('ASK')}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                type === 'ASK'
                  ? 'border-neighbor-coral bg-neighbor-coral/10 shadow-sm'
                  : 'border-border hover:border-muted-foreground/30'
              )}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  type === 'ASK'
                    ? 'bg-neighbor-coral text-neighbor-coral-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                <HandHeart className="h-6 w-6" />
              </div>
              <span
                className={cn(
                  'font-semibold text-sm',
                  type === 'ASK' ? 'text-neighbor-coral' : 'text-muted-foreground'
                )}
              >
                I Need
              </span>
            </button>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input
              id="post-title"
              placeholder={
                type === 'OFFER'
                  ? 'What are you offering?'
                  : 'What do you need?'
              }
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              className="bg-background"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {title.length}/80
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border-2 transition-all text-sm',
                    category === cat.value
                      ? `${cat.color} border-current shadow-sm`
                      : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="post-desc">Description</Label>
            <Textarea
              id="post-desc"
              placeholder="Add details — condition, availability, how much, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-background"
            />
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label>Expires in</Label>
            <div className="flex gap-2">
              {expirationOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={expiration === opt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setExpiration(opt.value)}
                  className={cn(
                    'flex-1 text-xs',
                    expiration === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : ''
                  )}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Preview toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full text-muted-foreground"
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Preview Post'}
          </Button>

          {/* Preview Card */}
          {showPreview && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {selectedCategory && (
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                        selectedCategory.color
                      )}
                    >
                      <selectedCategory.icon className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        className={cn(
                          'text-[10px]',
                          type === 'OFFER'
                            ? 'bg-neighbor-green text-neighbor-green-foreground'
                            : 'bg-neighbor-coral text-neighbor-coral-foreground'
                        )}
                      >
                        {type === 'OFFER' ? 'GIVE' : 'NEED'}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">
                      {title || 'Untitled Post'}
                    </h3>
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {description}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2">
                      {currentUser?.name || 'You'} · Expires in {expiration}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !title.trim() || !category}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-base font-semibold"
          >
            {isSubmitting ? 'Posting...' : 'Post It! 🚀'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
