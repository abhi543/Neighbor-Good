import { create } from 'zustand';

export type ViewType = 'onboarding' | 'map' | 'list' | 'chat' | 'profile' | 'create-post';

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  buildingCode: string | null;
  unitNumber: string | null;
  lat: number | null;
  lng: number | null;
  bio: string | null;
  warmthScore: number;
  gaveCount: number;
  receivedCount: number;
  flagCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  type: 'OFFER' | 'ASK';
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  lat: number | null;
  lng: number | null;
  expiresAt: string;
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export interface Exchange {
  id: string;
  postId: string;
  requesterId: string;
  ownerId: string;
  status: string;
  rating: number | null;
  badgeGiven: boolean;
  createdAt: string;
  updatedAt: string;
  post?: Post;
  requester?: User;
  owner?: User;
  messages?: Message[];
  _count?: { messages: number };
}

export interface Message {
  id: string;
  exchangeId: string;
  senderId: string;
  content: string;
  isSystem: boolean;
  createdAt: string;
  sender?: User;
}

export interface Filters {
  type: 'ALL' | 'OFFER' | 'ASK';
  category: string;
  search: string;
}

interface AppState {
  currentView: ViewType;
  currentUser: User | null;
  posts: Post[];
  currentChat: Exchange | null;
  selectedPost: Post | null;
  filters: Filters;
  mapCenter: [number, number];
  exchanges: Exchange[];
  isLoading: boolean;

  setView: (view: ViewType) => void;
  setUser: (user: User) => void;
  setPosts: (posts: Post[]) => void;
  setCurrentChat: (exchange: Exchange | null) => void;
  setSelectedPost: (post: Post | null) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setMapCenter: (center: [number, number]) => void;
  setExchanges: (exchanges: Exchange[]) => void;
  setLoading: (loading: boolean) => void;
  resetFilters: () => void;
  addPost: (post: Post) => void;
  updatePost: (id: string, data: Partial<Post>) => void;
  addExchange: (exchange: Exchange) => void;
  updateExchange: (id: string, data: Partial<Exchange>) => void;
}

const defaultFilters: Filters = {
  type: 'ALL',
  category: 'ALL',
  search: '',
};

export const useAppStore = create<AppState>((set) => ({
  currentView: 'onboarding',
  currentUser: null,
  posts: [],
  currentChat: null,
  selectedPost: null,
  filters: { ...defaultFilters },
  mapCenter: [40.7128, -74.006],
  exchanges: [],
  isLoading: false,

  setView: (view) => set({ currentView: view }),
  setUser: (user) => set({ currentUser: user, currentView: 'map' }),
  setPosts: (posts) => set({ posts }),
  setCurrentChat: (exchange) => set({ currentChat: exchange }),
  setSelectedPost: (post) => set({ selectedPost: post }),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  setMapCenter: (center) => set({ mapCenter: center }),
  setExchanges: (exchanges) => set({ exchanges }),
  setLoading: (loading) => set({ isLoading: loading }),
  resetFilters: () => set({ filters: { ...defaultFilters } }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (id, data) =>
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, ...data } : p)),
    })),
  addExchange: (exchange) =>
    set((state) => ({ exchanges: [exchange, ...state.exchanges] })),
  updateExchange: (id, data) =>
    set((state) => ({
      exchanges: state.exchanges.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
      currentChat:
        state.currentChat?.id === id
          ? { ...state.currentChat, ...data }
          : state.currentChat,
    })),
}));
