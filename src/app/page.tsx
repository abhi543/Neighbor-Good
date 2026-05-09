'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useAppStore, Post } from '@/lib/store';
import AppShell from '@/components/app-shell';
import OnboardingView from '@/components/onboarding-view';
import BulletinBoard from '@/components/bulletin-board';
import PostDetailSheet from '@/components/post-detail-sheet';
import CreatePostSheet from '@/components/create-post-sheet';
import ChatView from '@/components/chat-view';
import ProfileView from '@/components/profile-view';

const DEMO_USER_ID = 'demo_alex_cuid001';

// Dynamic import for MapView (requires window)
const MapView = dynamic(() => import('@/components/map-view'), { ssr: false });

export default function Home() {
  const {
    currentView,
    setView,
    setUser,
    setMapCenter,
    setPosts,
    setExchanges,
    currentUser,
    selectedPost,
    setSelectedPost,
  } = useAppStore();

  const [postSheetOpen, setPostSheetOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const initRef = useRef(false);

  // Initialize: check for existing demo user or show onboarding
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`/api/users?id=${DEMO_USER_ID}`);
        if (!cancelled) {
          if (res.ok) {
            const user = await res.json();
            setUser(user);
            setMapCenter([user.lat || 40.7128, user.lng || -74.006]);
          } else {
            setView('onboarding');
          }
          setIsInitialized(true);
        }
      } catch {
        if (!cancelled) {
          setView('onboarding');
          setIsInitialized(true);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [setUser, setMapCenter, setView]);

  // Fetch posts when user is available
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/posts');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setPosts(data);
        }
      } catch { /* silent */ }
    })();

    (async () => {
      try {
        const res = await fetch(`/api/exchanges?userId=${currentUser.id}`);
        if (res.ok && !cancelled) {
          const data = await res.json();
          setExchanges(data);
        }
      } catch { /* silent */ }
    })();

    return () => { cancelled = true; };
  }, [currentUser, setPosts, setExchanges]);

  // Listen for openPost custom event
  useEffect(() => {
    const handler = (e: Event) => {
      const post = (e as CustomEvent).detail as Post;
      setSelectedPost(post);
      setPostSheetOpen(true);
    };
    window.addEventListener('openPost', handler);
    return () => window.removeEventListener('openPost', handler);
  }, [setSelectedPost]);

  // Derive create sheet state from currentView
  const effectiveCreateSheetOpen = currentView === 'create-post';

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setPostSheetOpen(true);
  };

  const handleCreateSheetChange = (open: boolean) => {
    if (!open) {
      setView(currentUser ? 'map' : 'onboarding');
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading neighborhood...</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'onboarding':
        return <OnboardingView />;
      case 'map':
        return <MapView onPostClick={handlePostClick} />;
      case 'list':
        return <BulletinBoard onPostClick={handlePostClick} />;
      case 'chat':
        return <ChatView />;
      case 'profile':
        return <ProfileView />;
      case 'create-post':
        return <MapView onPostClick={handlePostClick} />;
      default:
        return <MapView onPostClick={handlePostClick} />;
    }
  };

  return (
    <AppShell>
      {renderView()}

      {/* Post Detail Sheet */}
      <PostDetailSheet
        open={postSheetOpen}
        onOpenChange={setPostSheetOpen}
        post={selectedPost}
      />

      {/* Create Post Sheet */}
      <CreatePostSheet
        open={effectiveCreateSheetOpen}
        onOpenChange={handleCreateSheetChange}
      />
    </AppShell>
  );
}
