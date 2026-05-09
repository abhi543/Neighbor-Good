'use client';

import { useAppStore, ViewType } from '@/lib/store';
import { Map, List, PlusCircle, MessageCircle, User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems: { view: ViewType; icon: typeof Map; label: string }[] = [
  { view: 'map', icon: Map, label: 'Map' },
  { view: 'list', icon: List, label: 'Board' },
  { view: 'create-post', icon: PlusCircle, label: 'Post' },
  { view: 'chat', icon: MessageCircle, label: 'Chat' },
  { view: 'profile', icon: User, label: 'Profile' },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { currentView, setView, currentUser } = useAppStore();

  if (currentView === 'onboarding') {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-14 max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            <h1 className="text-lg font-bold text-foreground">Neighbor Good</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('profile')}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                {currentUser?.name?.charAt(0) || '?'}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-14 bottom-0 w-16 bg-card border-r border-border flex-col items-center py-4 gap-1 z-40">
        {navItems.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => setView(view)}
            className={cn(
              'flex flex-col items-center gap-1 w-14 py-2 rounded-lg transition-colors',
              currentView === view
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map(({ view, icon: Icon, label }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors min-w-[48px]',
                currentView === view
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  view === 'create-post' && currentView === view
                    ? 'h-7 w-7 text-primary'
                    : ''
                )}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
