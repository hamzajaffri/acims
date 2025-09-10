import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Settings, Database, Shield, Mail, Bell } from "lucide-react";

interface SystemSettingsProps {
  settings: any;
  onSettingsChange: (field: string, value: string | boolean) => void;
}

export function SystemSettings({ settings, onSettingsChange }: SystemSettingsProps) {
  const { toast } = useToast();

  const exportData = () => {
    try {
      const allData = {
        cases: JSON.parse(localStorage.getItem('cim_cases') || '[]'),
        victims: JSON.parse(localStorage.getItem('cim_victims') || '[]'),
        evidence: JSON.parse(localStorage.getItem('cim_evidence') || '[]'),
        notes: JSON.parse(localStorage.getItem('cim_notes') || '[]'),
        users: JSON.parse(localStorage.getItem('cim_users') || '[]'),
        auditLogs: JSON.parse(localStorage.getItem('cim_audit_logs') || '[]'),
        reports: JSON.parse(localStorage.getItem('cim_reports') || '[]'),
        files: JSON.parse(localStorage.getItem('cim_files') || '[]'),
        settings: settings
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `cim-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: "System data has been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export system data.",
        variant: "destructive"
      });
    }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Import all data
        Object.keys(data).forEach(key => {
          if (key === 'settings') {
            localStorage.setItem('cim-settings', JSON.stringify(data[key]));
          } else {
            localStorage.setItem(`cim_${key}`, JSON.stringify(data[key]));
          }
        });

        toast({
          title: "Data Imported",
          description: "System data has been imported successfully. Please refresh the page.",
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Failed to import system data. Please check the file format.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all system data? This action cannot be undone.')) {
      const keys = ['cim_cases', 'cim_victims', 'cim_evidence', 'cim_notes', 'cim_users', 'cim_audit_logs', 'cim_reports', 'cim_files'];
      keys.forEach(key => localStorage.removeItem(key));
      
      toast({
        title: "Data Cleared",
        description: "All system data has been cleared.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Data Backup & Restore</Label>
            <div className="flex gap-2">
              <Button onClick={exportData} variant="outline">
                Export Data
              </Button>
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="outline">Import Data</Button>
              </div>
              <Button onClick={clearAllData} variant="destructive">
                Clear All Data
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backup</Label>
              <p className="text-sm text-muted-foreground">Automatically backup data</p>
            </div>
            <Switch 
              id="auto-backup" 
              checked={settings.autoBackup}
              onCheckedChange={(checked) => onSettingsChange('autoBackup', checked)}
            />
          </div>

          {settings.autoBackup && (
            <div className="space-y-2 ml-4">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select value={settings.backupFrequency} onValueChange={(value) => onSettingsChange('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="data-retention">Data Retention Period</Label>
            <Select value={settings.dataRetention} onValueChange={(value) => onSettingsChange('dataRetention', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="2years">2 Years</SelectItem>
                <SelectItem value="5years">5 Years</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
            </div>
            <Switch 
              id="two-factor" 
              checked={settings.twoFactor}
              onCheckedChange={(checked) => onSettingsChange('twoFactor', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="session-timeout">Auto Session Timeout</Label>
              <p className="text-sm text-muted-foreground">Automatically log out inactive users</p>
            </div>
            <Switch 
              id="session-timeout" 
              checked={settings.sessionTimeout}
              onCheckedChange={(checked) => onSettingsChange('sessionTimeout', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Enable maintenance mode for system updates</p>
            </div>
            <Switch 
              id="maintenance-mode" 
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => onSettingsChange('maintenanceMode', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-policy">Password Policy</Label>
            <Select value={settings.passwordPolicy || "medium"} onValueChange={(value) => onSettingsChange('passwordPolicy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select password policy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weak">Weak (6+ characters)</SelectItem>
                <SelectItem value="medium">Medium (8+ characters, mixed case)</SelectItem>
                <SelectItem value="strong">Strong (12+ characters, symbols required)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => onSettingsChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="system-alerts">System Alerts</Label>
              <p className="text-sm text-muted-foreground">Show system alerts and warnings</p>
            </div>
            <Switch 
              id="system-alerts" 
              checked={settings.systemAlerts}
              onCheckedChange={(checked) => onSettingsChange('systemAlerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="case-updates">Case Update Notifications</Label>
              <p className="text-sm text-muted-foreground">Notify when cases are updated</p>
            </div>
            <Switch 
              id="case-updates" 
              checked={settings.caseUpdates || false}
              onCheckedChange={(checked) => onSettingsChange('caseUpdates', checked)}
            />
          </div>

          {settings.emailNotifications && (
            <div className="space-y-2">
              <Label htmlFor="notification-frequency">Notification Frequency</Label>
              <Select value={settings.notificationFrequency || "immediate"} onValueChange={(value) => onSettingsChange('notificationFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="smtp-server">SMTP Server</Label>
            <Input 
              id="smtp-server" 
              placeholder="smtp.gmail.com"
              value={settings.smtpServer || ""}
              onChange={(e) => onSettingsChange('smtpServer', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port" 
                placeholder="587"
                value={settings.smtpPort || ""}
                onChange={(e) => onSettingsChange('smtpPort', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">SMTP Username</Label>
              <Input 
                id="smtp-username" 
                placeholder="your-email@domain.com"
                value={settings.smtpUsername || ""}
                onChange={(e) => onSettingsChange('smtpUsername', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smtp-ssl">Use SSL/TLS</Label>
              <p className="text-sm text-muted-foreground">Enable secure email connection</p>
            </div>
            <Switch 
              id="smtp-ssl" 
              checked={settings.smtpSsl || false}
              onCheckedChange={(checked) => onSettingsChange('smtpSsl', checked)}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}