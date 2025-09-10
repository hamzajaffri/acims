import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Save, RefreshCw, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/layout/ThemeProvider";
import { SystemSettings } from "@/components/settings/SystemSettings";
import { SupabaseService } from "@/lib/supabase-service";

export default function Settings() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState({
    orgName: "",
    adminEmail: "",
    notifications: false,
    autoBackup: false,
    twoFactor: false,
    sessionTimeout: false,
    backupFrequency: "daily",
    dataRetention: "1year",
    emailNotifications: true,
    systemAlerts: true,
    maintenanceMode: false,
    darkMode: theme === "dark",
    passwordPolicy: "medium",
    caseUpdates: false,
    notificationFrequency: "immediate",
    smtpServer: "",
    smtpPort: "587",
    smtpUsername: "",
    smtpSsl: true
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('cim-settings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed, darkMode: theme === "dark" }));
    }
  }, [theme]);

  // Load admin system settings from Supabase (admins only)
  useEffect(() => {
    (async () => {
      try {
        const dbSettings = await SupabaseService.getSystemSettings();
        if (dbSettings && Object.keys(dbSettings).length) {
          setSettings(prev => ({ ...prev, ...dbSettings, darkMode: theme === 'dark' }));
        }
      } catch (e) {
        // Non-admins may not have access due to RLS; ignore
      }
    })();
  }, []);
  
  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('cim-settings', JSON.stringify(settings));
  }, [settings]);

  const handleSave = async () => {
    try {
      await SupabaseService.upsertSystemSettings(settings);
      toast({
        title: "Settings Saved",
        description: "Admin settings updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error?.message || "Only admins can update system settings.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field === 'darkMode') {
      setTheme(value ? 'dark' : 'light');
    }
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    localStorage.removeItem('cim-settings');
    setSettings({
      orgName: "",
      adminEmail: "",
      notifications: false,
      autoBackup: false,
      twoFactor: false,
      sessionTimeout: false,
      backupFrequency: "daily",
      dataRetention: "1year",
      emailNotifications: true,
      systemAlerts: true,
      maintenanceMode: false,
      darkMode: theme === "dark",
      passwordPolicy: "medium",
      caseUpdates: false,
      notificationFrequency: "immediate",
      smtpServer: "",
      smtpPort: "587",
      smtpUsername: "",
      smtpSsl: true
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults.",
    });
  };
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* System Settings Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="settings-grid" width="7" height="7" patternUnits="userSpaceOnUse">
              <path d="M 7 0 L 0 0 0 7" fill="none" stroke="currentColor" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#settings-grid)" className="text-primary" />
        </svg>
      </div>

      {/* Configuration Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
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

      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Futuristic Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SYSTEM CONFIG
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">System Configuration & Security Protocols • Status: CONFIGURED</p>
            </div>
            <div className="flex gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button onClick={handleSave} className="gap-2 hover:shadow-glow transition-all">
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
              <Button onClick={handleReset} variant="outline" className="gap-2 border-border/50 hover:border-primary/30">
                <RefreshCw className="w-4 h-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  <SettingsIcon className="w-5 h-5 text-primary" />
                  GENERAL CONFIGURATION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-sm font-medium">Organization Name</Label>
                  <Input 
                    id="org-name" 
                    placeholder="Enter organization name"
                    value={settings.orgName}
                    onChange={(e) => handleInputChange('orgName', e.target.value)}
                    className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm font-medium">Admin Email</Label>
                  <Input 
                    id="admin-email" 
                    type="email" 
                    placeholder="admin@example.com"
                    value={settings.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/20 border border-border/30 hover:border-primary/20 transition-all">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications" className="text-sm font-medium">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email alerts for critical events</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <Switch 
                      id="notifications" 
                      checked={settings.notifications}
                      onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  {settings.darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                  VISUAL INTERFACE
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background/20 border border-border/30 hover:border-primary/20 transition-all group">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode" className="text-sm font-medium">Dark Mode Protocol</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark cyber interface</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <Switch 
                      id="dark-mode" 
                      checked={settings.darkMode}
                      onCheckedChange={(checked) => handleInputChange('darkMode', checked)}
                      className="data-[state=checked]:bg-primary group-hover:shadow-glow transition-all"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <SystemSettings settings={settings} onSettingsChange={handleInputChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}