import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Plus, Upload, Search, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StorageService } from "@/lib/storage";
import type { Evidence, Case, ChainOfCustodyEntry } from "@/types";
import { AuthService } from "@/lib/auth";
import { EvidenceUpload } from "@/components/evidence/EvidenceUpload";
import { EvidenceList } from "@/components/evidence/EvidenceList";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EvidenceEditDialog } from "@/components/evidence/EvidenceEditDialog";
import { EvidenceViewDialog } from "@/components/evidence/EvidenceViewDialog";

const evidenceSchema = z.object({
  name: z.string().min(1, "Evidence name is required"),
  description: z.string().optional(),
  type: z.enum(["physical", "digital"]),
  category: z.string().min(1, "Category is required"),
  caseId: z.string().min(1, "Case is required"),
  location: z.string().optional(),
  collectedBy: z.string().min(1, "Collector name is required"),
});

type EvidenceFormData = z.infer<typeof evidenceSchema>;

export default function Evidence() {
  const { toast } = useToast();
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [viewingEvidence, setViewingEvidence] = useState<Evidence | null>(null);

  const form = useForm<EvidenceFormData>({
    resolver: zodResolver(evidenceSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "physical",
      category: "",
      caseId: "",
      location: "",
      collectedBy: "",
    },
  });

  useEffect(() => {
    loadEvidence();
    loadCases();
  }, []);

  const loadEvidence = () => {
    const allEvidence = StorageService.getAllEvidence();
    setEvidence(allEvidence);
  };

  const loadCases = () => {
    const allCases = StorageService.getAllCases();
    setCases(allCases);
  };

  const onSubmit = (data: EvidenceFormData) => {
    try {
      const currentUser = AuthService.getCurrentUser();
      const initialChainEntry: ChainOfCustodyEntry = {
        id: `chain-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        handledBy: data.collectedBy,
        handledAt: new Date(),
        action: "collected",
        notes: `Evidence collected and logged by ${data.collectedBy}`,
      };

      const newEvidence = StorageService.createEvidence({
        name: data.name,
        type: data.type,
        category: data.category,
        description: data.description,
        caseId: data.caseId,
        location: data.location,
        collectedBy: data.collectedBy,
        collectedAt: new Date(),
        chainOfCustody: [initialChainEntry],
        status: "collected" as const,
        tags: [],
      });
      
      setEvidence(prev => [newEvidence, ...prev]);
      toast({
        title: "Evidence Added",
        description: "Evidence has been logged successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add evidence. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewEvidence = (item: Evidence) => setViewingEvidence(item);
  const handleEditEvidence = (item: Evidence) => setEditingEvidence(item);
  const handleEvidenceUpdated = (updated: Evidence) => {
    setEvidence(prev => prev.map(e => e.id === updated.id ? updated : e));
    setEditingEvidence(null);
  };
  const handleDeleteEvidence = (id: string) => {
    try {
      StorageService.deleteEvidence(id);
      setEvidence(prev => prev.filter(e => e.id !== id));
      toast({ title: "Evidence Deleted", description: "Evidence has been removed successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete evidence.", variant: "destructive" });
    }
  };

  const filteredEvidence = evidence.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cases.find(c => c.id === item.caseId)?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-evidence-digital to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-evidence-physical to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Digital Forensics Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="evidence-grid" width="6" height="6" patternUnits="userSpaceOnUse">
              <path d="M 6 0 L 0 0 0 6" fill="none" stroke="currentColor" strokeWidth="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#evidence-grid)" className="text-evidence-digital" />
        </svg>
      </div>

      {/* Floating Evidence Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-evidence-analysis/40 rounded-full animate-pulse"
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
                <div className="w-3 h-3 bg-evidence-digital rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  EVIDENCE VAULT
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">Digital Forensics & Evidence Management • Status: SECURE</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5">
                    <Plus className="w-4 h-4" />
                    Add Evidence
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/50">
                  <DialogHeader>
                    <DialogTitle className="font-orbitron">Add New Evidence</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      {/* ... keep existing form fields ... */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Evidence Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Evidence name or ID" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Evidence Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="physical">🔧 Physical</SelectItem>
                                <SelectItem value="digital">💾 Digital</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="caseId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Case</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select case" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {cases.map((caseItem) => (
                                  <SelectItem key={caseItem.id} value={caseItem.id}>
                                    {caseItem.caseNumber} - {caseItem.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Weapon, Document, Electronics" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Detailed description of the evidence..." {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collection Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Where was this evidence found?" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="collectedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Collected By</FormLabel>
                            <FormControl>
                              <Input placeholder="Officer or investigator name" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">Add Evidence</Button>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <EvidenceUpload />
            </div>
          </div>

          {/* Search Control Panel */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-6 shadow-glow animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search evidence database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
              />
            </div>
          </div>

          <div className="grid gap-6">
            {/* Digital Evidence Files */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  <Upload className="w-5 h-5 text-evidence-digital" />
                  DIGITAL EVIDENCE FILES
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EvidenceList />
              </CardContent>
            </Card>

            {/* Traditional Evidence Repository */}
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  <FileText className="w-5 h-5 text-evidence-physical" />
                  EVIDENCE REPOSITORY ({filteredEvidence.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEvidence.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEvidence.map((item, index) => {
                      const evidenceCase = cases.find(c => c.id === item.caseId);
                      return (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between p-4 border border-border/30 rounded-lg bg-background/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 group animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center group-hover:shadow-glow transition-all">
                              <File className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold font-orbitron">{item.name}</h3>
                              <div className="text-sm text-muted-foreground font-mono">
                                Case: {evidenceCase?.caseNumber || 'Unknown'} • 
                                Type: {item.type} • 
                                Collected: {item.collectedAt.toLocaleDateString()}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                {item.description}
                              </p>
                              {item.location && (
                                <div className="text-sm text-muted-foreground">
                                  Location: {item.location}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewEvidence(item)}
                              className="hover:bg-primary/10 hover:border-primary/30"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditEvidence(item)}
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
                                  <AlertDialogTitle className="font-orbitron">Delete Evidence</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this evidence? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteEvidence(item.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 animate-fade-in">
                    <div className="relative inline-block mb-6">
                      <FileText className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-evidence-digital rounded-full animate-pulse" />
                    </div>
                    <h3 className="font-orbitron text-xl font-semibold mb-3">
                      {evidence.length === 0 ? "EVIDENCE VAULT EMPTY" : "NO MATCHES FOUND"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {evidence.length === 0 
                        ? "Initialize your first evidence collection to begin forensic analysis" 
                        : "Adjust search parameters to refine evidence query results"
                      }
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-evidence-analysis rounded-full animate-pulse" />
                      <span className="font-mono">System ready for evidence input</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dialogs */}
          {editingEvidence && (
            <EvidenceEditDialog
              evidence={editingEvidence}
              cases={cases}
              open={!!editingEvidence}
              onOpenChange={(open) => !open && setEditingEvidence(null)}
              onEvidenceUpdated={handleEvidenceUpdated}
            />
          )}
          
          {viewingEvidence && (
            <EvidenceViewDialog
              evidence={viewingEvidence}
              cases={cases}
              open={!!viewingEvidence}
              onOpenChange={(open) => !open && setViewingEvidence(null)}
            />
          )}
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-evidence-digital/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-evidence-physical/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}