import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Database } from 'lucide-react';

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-card">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent transform rotate-12 animate-pulse"
          style={{
            transform: `translateX(${mousePosition.x * 0.1}px) translateY(${mousePosition.y * 0.1}px) rotate(12deg)`,
          }}
        />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" className="text-primary" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Case Investigation Manager</span>
            </div>
            
            <h1 className="font-orbitron text-6xl md:text-8xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent animate-fade-in">
              FUTURE
              <span className="block text-4xl md:text-6xl text-primary animate-pulse">
                CRIME TECH
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Advanced digital forensics platform powered by cutting-edge technology for modern law enforcement
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button size="lg" className="group bg-primary hover:bg-primary-glow transition-all duration-300 hover:shadow-glow">
                Access Terminal
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-primary/30 hover:border-primary/60 hover:bg-primary/5">
                System Overview
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Database,
                title: "Digital Evidence",
                description: "Advanced storage and analysis of digital forensic data"
              },
              {
                icon: Shield,
                title: "Secure Access",
                description: "Military-grade encryption and access control systems"
              },
              {
                icon: Zap,
                title: "Real-time Processing",
                description: "Instant case updates and collaborative investigation tools"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="group p-6 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-glow-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <feature.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-orbitron text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Status Indicator */}
          <div className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>System Status: Online • Security Level: Maximum</span>
          </div>
        </div>
      </div>

      {/* Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  );
};

export default Index;
