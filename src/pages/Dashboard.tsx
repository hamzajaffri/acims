import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StorageService } from '@/lib/storage';
import { AuthService } from '@/lib/auth';
import { DashboardStats, AuditLog } from '@/types';
import { Activity, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    const loadDashboardData = () => {
      try {
        const dashboardStats = StorageService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'login': return '🔐';
      case 'logout': return '🚪';
      default: return '📝';
    }
  };

  const getActivityColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'text-green-500';
      case 'update': return 'text-blue-500'; 
      case 'delete': return 'text-red-500';
      case 'login': return 'text-purple-500';
      case 'logout': return 'text-gray-500';
      default: return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="dashboard-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#dashboard-grid)" className="text-primary" />
        </svg>
      </div>

      {/* Floating Data Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
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

      <Header />
      
      <main className="flex-1 p-6 space-y-8 relative z-10">
        {/* Welcome Section */}
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              COMMAND CENTER
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Welcome back, <span className="text-primary font-semibold">{currentUser?.firstName}</span>. 
            System status: OPERATIONAL
          </p>
        </div>

        {/* Stats Cards */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <StatsCards stats={stats} />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          {/* Case Status Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-orbitron">
                <Activity className="w-5 h-5 text-primary" />
                <span>CASE STATUS MATRIX</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.casesByStatus).map(([status, count]) => {
                  const percentage = (count / stats.totalCases) * 100;
                  const statusColors = {
                    open: 'bg-case-open',
                    active: 'bg-case-active',
                    closed: 'bg-case-closed',
                    archived: 'bg-case-archived'
                  };
                  
                  return (
                    <div key={status} className="space-y-2 group">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize font-orbitron">{status}</span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {count} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 group-hover:shadow-glow ${statusColors[status as keyof typeof statusColors]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-orbitron">
                <Clock className="w-5 h-5 text-primary" />
                <span>ACTIVITY LOG</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-80">
                <div className="p-6 space-y-4">
                  {stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, index) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/20 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="text-lg">
                          {getActivityIcon(activity.action)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm">
                            <span className={`font-medium ${getActivityColor(activity.action)}`}>
                              {activity.action}
                            </span>
                            <span className="text-muted-foreground"> {activity.entity}</span>
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span className="font-mono">{format(activity.timestamp, 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="font-orbitron">NO RECENT ACTIVITY</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Evidence Type Distribution */}
        <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <CardHeader>
            <CardTitle className="font-orbitron">EVIDENCE DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(stats.evidenceByType).map(([type, count], index) => (
                <div 
                  key={type} 
                  className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-border/30 hover:border-primary/30 transition-all duration-300 hover:bg-primary/5 group"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full group-hover:shadow-glow transition-all ${type === 'digital' ? 'bg-evidence-digital' : 'bg-evidence-physical'}`} />
                    <span className="font-medium capitalize font-orbitron text-sm">{type} Evidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="font-mono text-sm font-bold text-primary">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
}