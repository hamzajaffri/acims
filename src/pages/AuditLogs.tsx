import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditLogsList } from "@/components/audit/AuditLogsList";

export default function AuditLogs() {
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-success to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-warning to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Audit Trail Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="audit-grid" width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#audit-grid)" className="text-success" />
        </svg>
      </div>

      {/* Floating Audit Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-success/30 rounded-full animate-pulse"
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
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  AUDIT TRAIL
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">System Activity Monitor & Security Logs • Status: TRACKING</p>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <AuditFilters />
            </div>
          </div>

          <div className="grid gap-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <AuditLogsList />
          </div>
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-success/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-warning/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}