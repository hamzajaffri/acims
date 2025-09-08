import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Folder, Search, Filter } from "lucide-react";
import { SupabaseService } from "@/lib/supabase-service";
import { Case } from "@/types";
import { CaseForm } from "@/components/cases/CaseForm";
import { ComprehensiveCaseForm } from "@/components/cases/ComprehensiveCaseForm";
import { CaseCard } from "@/components/cases/CaseCard";

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    loadCases();
  }, []);

  useEffect(() => {
    filterCases();
  }, [cases, searchTerm, statusFilter, priorityFilter]);

  const mapDbCaseToUi = (row: any): Case => ({
    id: row.id,
    caseNumber: row.case_number,
    title: row.title,
    description: row.description ?? "",
    status: row.status,
    priority: row.priority,
    assignedTo: Array.isArray(row.assigned_to) ? row.assigned_to : [],
    createdBy: row.created_by,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
    casePassword: row.case_password ?? undefined,
    location: row.location ?? undefined,
    category: row.category ?? "",
    estimatedCloseDate: row.estimated_close_date ? new Date(row.estimated_close_date) : undefined,
    actualCloseDate: row.actual_close_date ? new Date(row.actual_close_date) : undefined,
  });

  const loadCases = async () => {
    const dbCases = await SupabaseService.getAllCases();
    const mapped = dbCases.map((c: any) => mapDbCaseToUi(c));
    setCases(mapped);
  };

  const filterCases = () => {
    let filtered = cases;

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(c => c.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  };

  const handleCaseCreated = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-accent to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Floating Data Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
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

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="cyber-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#cyber-grid)" className="text-primary" />
        </svg>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Futuristic Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  CASE DATABASE
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">Investigation Management System • Status: ACTIVE</p>
            </div>
            <div className="flex gap-3">
              <CaseForm onCaseCreated={handleCaseCreated} />
              <ComprehensiveCaseForm onCaseCreated={handleCaseCreated} />
            </div>
          </div>

          {/* Advanced Control Panel */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-6 mb-6 shadow-glow">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-primary" />
              <span className="font-orbitron font-medium text-sm">FILTER PROTOCOLS</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search database..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-all">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">🟡 Open</SelectItem>
                  <SelectItem value="active">🔵 Active</SelectItem>
                  <SelectItem value="closed">🟢 Closed</SelectItem>
                  <SelectItem value="archived">⚫ Archived</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-primary/30 transition-all">
                  <SelectValue placeholder="Priority Filter" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center justify-center bg-primary/10 border border-primary/20 rounded-md px-3 py-2">
                <span className="font-orbitron text-sm font-medium text-primary">
                  {filteredCases.length}/{cases.length} CASES
                </span>
              </div>
            </div>
          </div>

          {/* Cases Display */}
          {filteredCases.length > 0 ? (
            <div className="grid gap-4 animate-fade-in">
              {filteredCases.map((caseItem, index) => (
                <div 
                  key={caseItem.id}
                  className="animate-fade-in hover:scale-[1.01] transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CaseCard 
                    case={caseItem}
                    onViewCase={(id) => console.log(`View case: ${id}`)}
                    onCaseUpdated={loadCases}
                    onCaseDeleted={loadCases}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg shadow-glow animate-fade-in">
              <div className="py-16">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <Folder className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                  </div>
                  <h3 className="font-orbitron text-xl font-semibold mb-3 text-foreground">
                    {cases.length === 0 ? "DATABASE EMPTY" : "NO MATCHES FOUND"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {cases.length === 0 
                      ? "Initialize your first investigation case to begin data collection and analysis" 
                      : "Adjust search parameters to refine database query results"
                    }
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span>System ready for case input</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}