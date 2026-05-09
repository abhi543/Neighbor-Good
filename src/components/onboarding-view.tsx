'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAppStore } from '@/lib/store';
import { Heart, MapPin, Sparkles, Home, ChevronRight } from 'lucide-react';

export default function OnboardingView() {
  const { setUser, setMapCenter } = useAppStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('Alex Rivera');
  const [bio, setBio] = useState('I have a drill, measuring tape, and basic tools. I love cooking and can help with tech setup.');
  const [buildingCode, setBuildingCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const DEMO_LAT = 40.7128;
  const DEMO_LNG = -74.006;

  const handleJoin = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!termsAccepted) {
      toast.error('Please accept the Terms of Neighborly Love');
      return;
    }

    setIsLoading(true);
    try {
      // Create/update user via API
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim() || undefined,
          buildingCode: buildingCode.trim() || undefined,
          lat: DEMO_LAT,
          lng: DEMO_LNG,
          unitNumber: '4B',
        }),
      });

      if (res.ok) {
        const user = await res.json();
        setUser({
          ...user,
          warmthScore: user.warmthScore || 8,
          gaveCount: user.gaveCount || 3,
          receivedCount: user.receivedCount || 2,
        });
        setMapCenter([DEMO_LAT, DEMO_LNG]);
        toast.success('Welcome to your neighborhood circle! 🏘️');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Heart className="h-10 w-10 text-primary fill-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Neighbor Good
          </h1>
          <p className="text-muted-foreground">
            Share, Help, Connect — right in your building
          </p>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s <= step
                  ? 'bg-primary w-8'
                  : 'bg-muted w-6'
              }`}
            />
          ))}
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-6">
            {step === 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <Sparkles className="h-5 w-5 text-neighbor-amber" />
                  <h2 className="text-lg font-semibold">Tell us about yourself</h2>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      placeholder="What should we call you?"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">
                      What do you have? What can you do?
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tools, skills, things you're happy to share..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      className="bg-background"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-5 w-5 text-neighbor-green" />
                  <h2 className="text-lg font-semibold">Your neighborhood</h2>
                </div>

                {/* Simulated map area */}
                <div className="relative rounded-xl overflow-hidden bg-neighbor-green/10 border-2 border-neighbor-green/30 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-neighbor-green/20 border-2 border-neighbor-green flex items-center justify-center">
                      <Home className="h-8 w-8 text-neighbor-green" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Village Area, Manhattan
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ~40.7128°N, 74.0060°W
                    </p>
                    <div className="mt-2 flex items-center justify-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-neighbor-green animate-pulse" />
                      <span className="text-xs text-neighbor-green">
                        Geofence: 500m radius
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  We&apos;ll connect you with neighbors within walking distance. This keeps things local and safe!
                </p>

                <div className="space-y-2">
                  <Label htmlFor="building-code">
                    Building invite code (optional)
                  </Label>
                  <Input
                    id="building-code"
                    placeholder="e.g., MAPLE42"
                    value={buildingCode}
                    onChange={(e) => setBuildingCode(e.target.value)}
                    className="bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Got a code from a neighbor? Enter it here.
                  </p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <Heart className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Ready to be a good neighbor?</h2>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">
                    Terms of Neighborly Love
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                    <li>Be kind and respectful in all exchanges</li>
                    <li>Return borrowed items in good condition</li>
                    <li>Communicate honestly and promptly</li>
                    <li>Look out for each other&apos;s safety</li>
                    <li>Share generously, ask graciously</li>
                  </ul>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
                  >
                    I agree to the Terms of Neighborly Love and promise to be
                    the kind of neighbor I&apos;d want to have.
                  </Label>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  Back
                </Button>
              )}
              {step < 2 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={step === 0 && !name.trim()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleJoin}
                  disabled={isLoading || !termsAccepted}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLoading ? 'Joining...' : 'Join Your Circle 🤝'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
