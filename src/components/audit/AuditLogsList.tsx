import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Shield, 
  User, 
  FileText, 
  Lock, 
  Activity,
  Calendar,
  Clock,
  Monitor
} from "lucide-react";

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity: string;
  entity_id: string;
  details: any;
  timestamp: string;
  ip_address?: any;
}

export function AuditLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    loadAuditLogs();
    // Poll for new logs every 5 seconds
    const interval = setInterval(loadAuditLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadAuditLogs = async () => {
    try {
      const { SupabaseService } = await import('@/lib/supabase-service');
      const data = await SupabaseService.getAllAuditLogs();
      setLogs(data as AuditLog[]);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return <Lock className="w-4 h-4" />;
    if (action.includes('CREATE') || action.includes('ADD')) return <FileText className="w-4 h-4" />;
    if (action.includes('UPDATE') || action.includes('EDIT')) return <Activity className="w-4 h-4" />;
    if (action.includes('DELETE') || action.includes('REMOVE')) return <Shield className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('LOGIN')) return "bg-green-100 text-green-800";
    if (action.includes('LOGOUT')) return "bg-gray-100 text-gray-800";
    if (action.includes('CREATE') || action.includes('ADD')) return "bg-blue-100 text-blue-800";
    if (action.includes('UPDATE') || action.includes('EDIT')) return "bg-yellow-100 text-yellow-800";
    if (action.includes('DELETE') || action.includes('REMOVE')) return "bg-red-100 text-red-800";
    return "bg-purple-100 text-purple-800";
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getActionDescription = (log: AuditLog) => {
    const action = log.action.toLowerCase().replace(/_/g, ' ');
    const entity = log.entity.charAt(0).toUpperCase() + log.entity.slice(1);
    
    let description = `${action} ${entity}`;
    
    if (log.details) {
      if (log.details.caseNumber) {
        description += ` #${log.details.caseNumber}`;
      }
      if (log.details.title) {
        description += `: "${log.details.title}"`;
      }
      if (log.details.suspectName) {
        description += `: ${log.details.suspectName}`;
      }
      if (log.details.victimName) {
        description += `: ${log.details.victimName}`;
      }
      if (log.details.fileName) {
        description += `: ${log.details.fileName}`;
      }
    }
    
    return description;
  };

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
          <p className="text-muted-foreground">System activity will be tracked here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Logs
          </div>
          <span className="text-sm text-muted-foreground">
            {logs.length} total events
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full mt-0.5">
                      {getActionIcon(log.action)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          by {log.user_id}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium">
                        {getActionDescription(log)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                        {log.ip_address && (
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            <span>{log.ip_address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}