'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Lock, User, UserCog, Briefcase, HardHat } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Default to true for better UX
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remember me preference on mount
  useEffect(() => {
    const savedPreference = localStorage.getItem('rememberMe');
    if (savedPreference !== null) {
      setRememberMe(savedPreference === 'true');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else {
        // Store remember me preference
        localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
        
        // Check if user needs to change password
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('must_change_password')
            .eq('id', user.id)
            .single();

          if (profile?.must_change_password) {
            // Redirect to password change page
            router.push('/change-password');
            router.refresh();
            return;
          }
        }
        
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(demoEmail, demoPassword);
      
      if (error) {
        setError(error.message);
      } else {
        localStorage.setItem('rememberMe', 'true');
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center p-4 pt-12 sm:pt-16 md:pt-24 relative overflow-hidden bg-background">
      <div className="w-full max-w-md relative z-10">
        {/* Brand Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary rounded-2xl p-5 shadow-lg shadow-primary/20">
            <Lock className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">MPDEE DIGIDOCS</h1>
          <p className="text-sm text-muted-foreground">Digital Work Document System - Demonstration App</p>
        </div>

        {/* Login Card */}
        <Card className="bg-card border-border shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 h-12"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-input bg-background text-primary focus:ring-primary focus:ring-offset-background"
                  disabled={loading}
                />
                <Label 
                  htmlFor="remember" 
                  className="text-sm font-normal cursor-pointer text-foreground"
                >
                  Keep me signed in
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base shadow-lg shadow-primary/20 transition-all"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="mb-4">Contact your administrator for account access</p>
        </div>

        {/* Demo Login Buttons */}
        <Card className="bg-card border-border shadow-lg mt-6">
          <CardContent className="p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 text-center">Quick Demo Login</h3>
            <div className="space-y-3">
              {/* Admin Demo */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                onClick={() => handleDemoLogin('david.clarke@digidocsdemo.com', 'Password123')}
                disabled={loading}
              >
                <UserCog className="h-5 w-5 mr-3 text-purple-500" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">Administrator</div>
                  <div className="text-xs text-muted-foreground">David Clarke - Full system access</div>
                </div>
              </Button>

              {/* Manager Demo */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                onClick={() => handleDemoLogin('sarah.johnson@digidocsdemo.com', 'Password123')}
                disabled={loading}
              >
                <Briefcase className="h-5 w-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">Manager</div>
                  <div className="text-xs text-muted-foreground">Sarah Johnson - Team oversight & approvals</div>
                </div>
              </Button>

              {/* Employee Demo */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                onClick={() => handleDemoLogin('james.harrison@digidocsdemo.com', 'Password123')}
                disabled={loading}
              >
                <User className="h-5 w-5 mr-3 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">Employee</div>
                  <div className="text-xs text-muted-foreground">James Harrison - Submit timesheets & inspections</div>
                </div>
              </Button>

              {/* Contractor Demo */}
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start h-auto py-3 px-4 hover:bg-accent"
                onClick={() => handleDemoLogin('michael.davis@digidocsdemo.com', 'Password123')}
                disabled={loading}
              >
                <HardHat className="h-5 w-5 mr-3 text-orange-500" />
                <div className="text-left">
                  <div className="font-semibold text-foreground">Contractor</div>
                  <div className="text-xs text-muted-foreground">Michael Davis - Limited contractor access</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

