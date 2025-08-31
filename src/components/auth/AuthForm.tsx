import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { useSupabase } from '@/hooks/useSupabase';
import { Shield, Users, Lock, Mail } from 'lucide-react';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useSupabase();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="auth-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#auth-grid)" className="text-primary" />
        </svg>
      </div>

      {/* Security Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <h1 className="font-orbitron text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SECURE ACCESS
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Case Investigation Manager • Authentication Required
          </p>
        </div>

        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="font-orbitron">AUTHENTICATION PORTAL</CardTitle>
            </div>
            <CardDescription className="text-center">
              Secure login system for authorized personnel only
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@department.gov"
                  className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full gap-2 hover:shadow-glow transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Shield className="w-4 h-4" />
                )}
                {loading ? 'Authenticating...' : 'Access System'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-2">
            <div className="text-xs text-muted-foreground text-center">
              Authorized personnel only • All activities are monitored and logged
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-mono">System Status: SECURE</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}