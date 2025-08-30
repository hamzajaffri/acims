import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Search, User, MapPin, Phone, Mail, FileText } from "lucide-react";
import { Suspect } from "@/types/suspect";
import { SuspectForm } from "@/components/suspects/SuspectForm";
import { SuspectEditDialog } from "@/components/suspects/SuspectEditDialog";
import { SuspectViewDialog } from "@/components/suspects/SuspectViewDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { StorageService } from "@/lib/storage";

export default function Suspects() {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const [filteredSuspects, setFilteredSuspects] = useState<Suspect[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<Suspect | null>(null);
  const [viewingSuspect, setViewingSuspect] = useState<Suspect | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSuspects();
  }, []);

  useEffect(() => {
    filterSuspects();
  }, [suspects, searchTerm, statusFilter]);

  const loadSuspects = () => {
    const allSuspects = JSON.parse(localStorage.getItem('suspects') || '[]');
    setSuspects(allSuspects);
  };

  const filterSuspects = () => {
    let filtered = suspects;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.alias && s.alias.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.cnicId && s.cnicId.includes(searchTerm))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.status === statusFilter);
    }

    setFilteredSuspects(filtered);
  };

  const handleSuspectAdded = (newSuspect: Suspect) => {
    setSuspects(prev => [newSuspect, ...prev]);
    setShowAddForm(false);
  };

  const handleViewSuspect = (suspect: Suspect) => {
    setViewingSuspect(suspect);
  };

  const handleEditSuspect = (suspect: Suspect) => {
    setEditingSuspect(suspect);
  };

  const handleSuspectUpdated = (updatedSuspect: Suspect) => {
    setSuspects(prev => prev.map(s => s.id === updatedSuspect.id ? updatedSuspect : s));
    setEditingSuspect(null);
  };

  const handleDeleteSuspect = async (suspectId: string) => {
    try {
      StorageService.deleteSuspect(suspectId);
      setSuspects(prev => prev.filter(s => s.id !== suspectId));
      toast({
        title: "Suspect Deleted",
        description: "Suspect has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete suspect. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "wanted": return "destructive";
      case "arrested": return "secondary";
      case "released": return "outline";
      case "under_investigation": return "default";
      default: return "default";
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case "under_investigation": return "Under Investigation";
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-destructive to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-warning to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Suspect Database Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="suspects-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#suspects-grid)" className="text-destructive" />
        </svg>
      </div>

      {/* Floating Suspect Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-destructive/30 rounded-full animate-pulse"
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
                <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SUSPECT DATABASE
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">Suspect Identification & Tracking System • Status: MONITORING</p>
            </div>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="animate-fade-in hover:shadow-glow transition-all" style={{ animationDelay: '0.2s' }}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Suspect
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-orbitron">Add New Suspect</DialogTitle>
                  <DialogDescription>
                    Enter suspect information and details
                  </DialogDescription>
                </DialogHeader>
                <SuspectForm 
                  caseId="general" 
                  onSuspectAdded={handleSuspectAdded}
                  onCancel={() => setShowAddForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Advanced Control Panel */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-6 mb-6 shadow-glow animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-destructive transition-colors" />
                <Input
                  placeholder="Search suspect database..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 hover:border-destructive/30 focus:border-destructive/60 transition-all"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background/50 border-border/50 hover:border-destructive/30 transition-all">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border/50">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="wanted">🔴 Wanted</SelectItem>
                  <SelectItem value="arrested">🟡 Arrested</SelectItem>
                  <SelectItem value="released">🟢 Released</SelectItem>
                  <SelectItem value="under_investigation">🔵 Under Investigation</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                <span className="font-orbitron text-sm font-medium text-destructive">
                  {filteredSuspects.length}/{suspects.length} SUSPECTS
                </span>
              </div>
            </div>
          </div>

          {/* Suspects Grid */}
          {filteredSuspects.length > 0 ? (
            <div className="grid gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              {filteredSuspects.map((suspect, index) => (
                <Card 
                  key={suspect.id} 
                  className="border-border/50 bg-card/60 backdrop-blur-sm hover:shadow-glow-lg transition-all duration-300 hover:border-destructive/30 group animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-orbitron font-semibold text-lg">
                            {suspect.firstName} {suspect.lastName}
                          </h3>
                          {suspect.alias && (
                            <span className="text-sm text-muted-foreground font-mono">
                              (aka {suspect.alias})
                            </span>
                          )}
                          <Badge variant={getStatusColor(suspect.status)} className="group-hover:shadow-glow transition-all">
                            {getStatusDisplayName(suspect.status)}
                          </Badge>
                        </div>
                        {suspect.cnicId && (
                          <p className="text-sm text-muted-foreground font-mono">
                            CNIC: {suspect.cnicId}
                          </p>
                        )}
                       </div>
                       <div className="flex gap-2">
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleViewSuspect(suspect)}
                           className="hover:bg-primary/10 hover:border-primary/30"
                         >
                           View
                         </Button>
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleEditSuspect(suspect)}
                           className="hover:bg-accent/10 hover:border-accent/30"
                         >
                           Edit
                         </Button>
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                             <Button variant="destructive" size="sm" className="hover:shadow-glow">
                               Delete
                             </Button>
                           </AlertDialogTrigger>
                           <AlertDialogContent className="bg-card/95 backdrop-blur-sm">
                             <AlertDialogHeader>
                               <AlertDialogTitle className="font-orbitron">Delete Suspect</AlertDialogTitle>
                               <AlertDialogDescription>
                                 Are you sure you want to delete this suspect? This action cannot be undone.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDeleteSuspect(suspect.id)}>
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                       </div>
                     </div>
                   </CardHeader>
                  <CardContent className="space-y-3">
                    {suspect.description && (
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {suspect.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {suspect.age && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="w-4 h-4 text-primary" />
                          <span>Age: {suspect.age}</span>
                        </div>
                      )}
                      {suspect.lastKnownLocation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4 text-destructive" />
                          <span>{suspect.lastKnownLocation}</span>
                        </div>
                      )}
                      {suspect.contactPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4 text-accent" />
                          <span>{suspect.contactPhone}</span>
                        </div>
                      )}
                      {suspect.occupation && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText className="w-4 h-4 text-warning" />
                          <span>{suspect.occupation}</span>
                        </div>
                      )}
                    </div>

                    {suspect.criminalHistory && (
                      <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-sm font-medium text-foreground font-orbitron">Criminal History:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {suspect.criminalHistory}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg shadow-glow animate-fade-in">
              <div className="py-16">
                <div className="text-center">
                  <div className="relative inline-block mb-6">
                    <User className="w-16 h-16 text-muted-foreground mx-auto" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
                  </div>
                  <h3 className="font-orbitron text-xl font-semibold mb-3">
                    {suspects.length === 0 ? "SUSPECT DATABASE EMPTY" : "NO MATCHES FOUND"}
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {suspects.length === 0 
                      ? "Initialize your first suspect record to begin tracking" 
                      : "Adjust search parameters to refine database query results"
                    }
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                    <span className="font-mono">System ready for suspect input</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dialogs */}
          {editingSuspect && (
            <SuspectEditDialog
              suspect={editingSuspect}
              open={!!editingSuspect}
              onOpenChange={(open) => !open && setEditingSuspect(null)}
              onSuspectUpdated={handleSuspectUpdated}
            />
          )}
          
          {viewingSuspect && (
            <SuspectViewDialog
              suspect={viewingSuspect}
              open={!!viewingSuspect}
              onOpenChange={(open) => !open && setViewingSuspect(null)}
            />
          )}
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-warning/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}