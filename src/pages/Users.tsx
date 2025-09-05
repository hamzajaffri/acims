import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, UserCheck } from "lucide-react";
import { UserForm } from "@/components/users/UserForm";
import { UserEditDialog } from "@/components/users/UserEditDialog";
import { UserDeleteDialog } from "@/components/users/UserDeleteDialog";
import { SupabaseService } from "@/lib/supabase-service";
import { useToast } from "@/hooks/use-toast";
import { useSupabase } from "@/hooks/useSupabase";
import { supabase } from "@/integrations/supabase/client";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useSupabase();

  useEffect(() => {
    if (user) {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      console.log('Loading users...', { user: user?.id });
      const data = await SupabaseService.getAllUsers();
      console.log('Users loaded:', data);
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: `Failed to load users: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* User Management Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="users-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#users-grid)" className="text-primary" />
        </svg>
      </div>

      {/* Floating User Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Futuristic Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  USER MANAGEMENT
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">System Access Control & User Administration • Status: SECURE</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <UserForm />
            </div>
          </div>

          <div className="grid gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  <UserCheck className="w-5 h-5 text-primary" />
                  SYSTEM USERS
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-4">
                     {users.map((user: any, index: number) => (
                       <div 
                         key={user.id} 
                         className="flex items-center justify-between p-4 border border-border/30 rounded-lg bg-background/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                         style={{ animationDelay: `${index * 0.1}s` }}
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center group-hover:shadow-glow transition-all">
                             <User className="w-5 h-5 text-primary" />
                           </div>
                           <div>
                             <h3 className="font-semibold font-orbitron">{user.first_name} {user.last_name}</h3>
                             <div className="text-sm text-muted-foreground font-mono">
                               {user.email} • Role: {user.role} • Status: {user.is_active ? 'Active' : 'Inactive'}
                             </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-2">
                           <UserEditDialog user={user} onUserUpdated={loadUsers} />
                           <UserDeleteDialog user={user} onUserDeleted={loadUsers} />
                         </div>
                       </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="relative inline-block mb-6">
                      <User className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                    </div>
                    <h3 className="font-orbitron text-xl font-semibold mb-3 text-foreground">USER DATABASE EMPTY</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Initialize your first system user to begin access management
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="font-mono">System ready for user registration</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}