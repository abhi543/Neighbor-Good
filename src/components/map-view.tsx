'use client';

import { useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppStore, Post } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Wrench, CookingPot, HandHeart, Package, Navigation, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const categoryIcons: Record<string, { icon: typeof Wrench; color: string }> = {
  TOOLS: { icon: Wrench, color: 'bg-neighbor-amber text-neighbor-amber-foreground' },
  KITCHEN: { icon: CookingPot, color: 'bg-neighbor-coral text-neighbor-coral-foreground' },
  SERVICE: { icon: HandHeart, color: 'bg-neighbor-green text-neighbor-green-foreground' },
  OTHER: { icon: Package, color: 'bg-muted text-muted-foreground' },
};

function createMarkerIcon(type: string) {
  const isOffer = type === 'OFFER';
  const bgColor = isOffer ? '#22c55e' : '#f97316';
  const letter = isOffer ? 'G' : 'W';

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${bgColor};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: 700;
      font-family: system-ui;
    ">${letter}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function MapControls({ onLocate }: { onLocate: () => void }) {
  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
      <Button
        size="icon"
        variant="outline"
        className="bg-card/90 backdrop-blur-sm shadow-md h-10 w-10 rounded-full"
        onClick={onLocate}
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}

function FlyToCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  const hasFlown = useRef(false);

  useEffect(() => {
    if (!hasFlown.current) {
      map.flyTo(center, 15, { duration: 1 });
      hasFlown.current = true;
    }
  }, [map, center]);

  return null;
}

function formatDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
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
  return d < 1000 ? `${Math.round(d)}m` : `${(d / 1000).toFixed(1)}km`;
}

interface MapViewProps {
  onPostClick: (post: Post) => void;
}

export default function MapViewInner({ onPostClick }: MapViewProps) {
  const { posts, mapCenter, currentUser, setMapCenter } = useAppStore();
  const mapRef = useRef<L.Map | null>(null);

  const handleLocate = useCallback(() => {
    if (currentUser?.lat && currentUser?.lng) {
      setMapCenter([currentUser.lat, currentUser.lng]);
      mapRef.current?.flyTo([currentUser.lat, currentUser.lng], 15, {
        duration: 0.5,
      });
    }
  }, [currentUser, setMapCenter]);

  const activePosts = posts.filter((p) => p.status === 'ACTIVE' && p.lat && p.lng);

  return (
    <div className="relative h-[calc(100vh-8rem)] md:h-[calc(100vh-3.5rem)] md:ml-16">
      {/* Filter indicator */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="bg-card/90 backdrop-blur-sm shadow-md rounded-lg px-3 py-2 flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            {activePosts.length} posts nearby
          </span>
        </div>
      </div>

      <MapControls onLocate={handleLocate} />

      <MapContainer
        center={mapCenter}
        zoom={15}
        className="h-full w-full z-0"
        ref={(map) => {
          if (map) mapRef.current = map;
        }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToCenter center={mapCenter} />

        {/* User location geofence */}
        {currentUser?.lat && currentUser?.lng && (
          <>
            <Circle
              center={[currentUser.lat, currentUser.lng]}
              radius={500}
              pathOptions={{
                color: '#22c55e',
                fillColor: '#22c55e',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: '8 4',
              }}
            />
            <Marker
              position={[currentUser.lat, currentUser.lng]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div style="
                  background: oklch(0.55 0.12 65);
                  width: 14px;
                  height: 14px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 0 0 4px oklch(0.55 0.12 65 / 0.2), 0 2px 6px rgba(0,0,0,0.2);
                "></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
              })}
            />
          </>
        )}

        {/* Post markers */}
        {activePosts.map((post) => (
          <Marker
            key={post.id}
            position={[post.lat!, post.lng!]}
            icon={createMarkerIcon(post.type)}
            eventHandlers={{
              click: () => onPostClick(post),
            }}
          >
            <Popup maxWidth={250} className="custom-popup">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={post.type === 'OFFER' ? 'default' : 'secondary'}
                    className={
                      post.type === 'OFFER'
                        ? 'bg-neighbor-green text-neighbor-green-foreground text-xs'
                        : 'bg-neighbor-coral text-neighbor-coral-foreground text-xs'
                    }
                  >
                    {post.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm text-foreground leading-tight">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {post.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{post.author?.name}</span>
                  {currentUser?.lat && currentUser?.lng && post.lat && post.lng && (
                    <span>
                      {formatDistance(currentUser.lat, currentUser.lng, post.lat, post.lng)}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPostClick(post);
                  }}
                  className="w-full text-xs font-medium text-primary hover:underline text-center py-1"
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
