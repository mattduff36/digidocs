'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect based on online status
    if (typeof navigator !== 'undefined') {
      if (navigator.onLine) {
        router.push('/dashboard');
      } else {
        // Redirect to offline page when offline
        router.push('/offline');
      }
    }
  }, [router]);

  const handleGoToDashboard = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      router.push('/offline');
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Logo/Brand */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            MPDEE Digidocs
          </h1>
          <p className="text-muted-foreground text-lg">
            Digital Workforce Management
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <p className="text-foreground text-sm">
            Opening your dashboard...
          </p>
          <p className="text-muted-foreground text-xs">
            This app requires an internet connection to work.
          </p>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleGoToDashboard}
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
