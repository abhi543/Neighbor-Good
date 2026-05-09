'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, Post } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Search, Wrench, CookingPot, HandHeart, Package, MapPin, Clock, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryConfig: Record<string, { icon: typeof Wrench; label: string; color: string }> = {
  TOOLS: { icon: Wrench, label: 'Tools', color: 'bg-neighbor-amber/10 text-neighbor-amber border-neighbor-amber/20' },
  KITCHEN: { icon: CookingPot, label: 'Kitchen', color: 'bg-neighbor-coral/10 text-neighbor-coral border-neighbor-coral/20' },
  SERVICE: { icon: HandHeart, label: 'Service', color: 'bg-neighbor-green/10 text-neighbor-green border-neighbor-green/20' },
  OTHER: { icon: Package, label: 'Other', color: 'bg-muted/50 text-muted-foreground border-muted' },
};

const typeFilters = [
  { value: 'ALL', label: 'All' },
  { value: 'OFFER', label: 'Offers' },
  { value: 'ASK', label: 'Asks' },
];

function formatDistanceBetween(lat1: number, lng1: number, lat2: number, lng2: number): string {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d < 1000 ? `${Math.round(d)}m away` : `${(d / 1000).toFixed(1)}km away`;
}

interface BulletinBoardProps {
  onPostClick: (post: Post) => void;
}

export default function BulletinBoard({ onPostClick }: BulletinBoardProps) {
  const { posts, filters, setFilters, currentUser } = useAppStore();
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);

  const activePosts = posts.filter((p) => p.status === 'ACTIVE');

  const filteredPosts = activePosts.filter((post) => {
    if (filters.type !== 'ALL' && post.type !== filters.type) return false;
    if (filters.category !== 'ALL' && post.category !== filters.category) return false;
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (
        !post.title.toLowerCase().includes(s) &&
        !(post.description || '').toLowerCase().includes(s)
      )
        return false;
    }
    return true;
  });

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setFilters({ search: value });
  };

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3.5rem)] md:ml-16 flex flex-col">
      {/* Search & Filters */}
      <div className="px-4 pt-4 pb-2 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2">
          {typeFilters.map((f) => (
            <Button
              key={f.value}
              variant={filters.type === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ type: f.value as 'ALL' | 'OFFER' | 'ASK' })}
              className={cn(
                'rounded-full text-xs px-4',
                filters.type === f.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {f.label}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={cn(
              'rounded-full text-xs px-3 ml-auto',
              showCategoryFilter && 'bg-primary text-primary-foreground border-primary'
            )}
          >
            <Filter className="h-3 w-3 mr-1" />
            Category
          </Button>
        </div>

        {/* Category Filter Chips */}
        {showCategoryFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            <Button
              variant={filters.category === 'ALL' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters({ category: 'ALL' })}
              className="rounded-full text-xs px-3"
            >
              All Categories
            </Button>
            {Object.entries(categoryConfig).map(([key, cfg]) => (
              <Button
                key={key}
                variant={filters.category === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ category: key })}
                className="rounded-full text-xs px-3"
              >
                <cfg.icon className="h-3 w-3 mr-1" />
                {cfg.label}
              </Button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Posts List */}
      <ScrollArea className="flex-1 px-4 pb-20">
        {filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-medium">No posts found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filteredPosts.map((post, index) => {
              const catConfig = categoryConfig[post.category] || categoryConfig.OTHER;
              const isExpiringSoon =
                isPast(new Date(post.expiresAt.getTime() - 4 * 60 * 60 * 1000));
              const isExpired = isPast(post.expiresAt);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border-border overflow-hidden"
                    onClick={() => onPostClick(post)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Category Icon */}
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                            catConfig.color
                          )}
                        >
                          <catConfig.icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={cn(
                                'text-[10px] px-1.5 py-0 font-semibold',
                                post.type === 'OFFER'
                                  ? 'bg-neighbor-green text-neighbor-green-foreground'
                                  : 'bg-neighbor-coral text-neighbor-coral-foreground'
                              )}
                            >
                              {post.type === 'OFFER' ? 'GIVE' : 'NEED'}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {post.category}
                            </span>
                            {isExpired ? (
                              <span className="text-[10px] text-destructive">Expired</span>
                            ) : isExpiringSoon ? (
                              <span className="text-[10px] text-neighbor-amber">Expiring soon</span>
                            ) : null}
                          </div>

                          <h3 className="font-semibold text-sm text-foreground leading-tight mb-1 line-clamp-1">
                            {post.title}
                          </h3>

                          {post.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {post.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{post.author?.name}</span>
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(post.createdAt), {
                                addSuffix: true,
                              })}
                            </span>
                            {currentUser?.lat &&
                              currentUser?.lng &&
                              post.lat &&
                              post.lng && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3" />
                                  {formatDistanceBetween(
                                    currentUser.lat,
                                    currentUser.lng,
                                    post.lat,
                                    post.lng
                                  )}
                                </span>
                              )}
                          </div>
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
