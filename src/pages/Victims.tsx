import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { StorageService } from "@/lib/storage";
import { Victim, Case } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { VictimEditDialog } from "@/components/victims/VictimEditDialog";
import { VictimViewDialog } from "@/components/victims/VictimViewDialog";

const victimSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  cnicId: z.string().min(1, "CNIC ID is required"),
  age: z.string().optional(),
  gender: z.enum(["male", "female", "other", "unknown"]),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  address: z.string().optional(),
  caseId: z.string().min(1, "Case is required"),
  notes: z.string().optional(),
});

type VictimFormData = z.infer<typeof victimSchema>;

export default function Victims() {
  const { toast } = useToast();
  const [victims, setVictims] = useState<Victim[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVictim, setEditingVictim] = useState<Victim | null>(null);
  const [viewingVictim, setViewingVictim] = useState<Victim | null>(null);

  const form = useForm<VictimFormData>({
    resolver: zodResolver(victimSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      cnicId: "",
      age: "",
      gender: "unknown",
      contactPhone: "",
      contactEmail: "",
      address: "",
      caseId: "",
      notes: "",
    },
  });

  useEffect(() => {
    loadVictims();
    loadCases();
  }, []);

  const loadVictims = () => {
    const allVictims = StorageService.getAllVictims();
    setVictims(allVictims);
  };

  const loadCases = () => {
    const allCases = StorageService.getAllCases();
    setCases(allCases);
  };

  const onSubmit = (data: VictimFormData) => {
    try {
      const newVictim = StorageService.createVictim({
        firstName: data.firstName,
        lastName: data.lastName,
        cnicId: data.cnicId,
        age: data.age ? parseInt(data.age) : undefined,
        gender: data.gender,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        address: data.address,
        caseId: data.caseId,
        notes: data.notes,
      });
      setVictims(prev => [newVictim, ...prev]);
      toast({
        title: "Victim Added",
        description: "Victim information has been saved successfully.",
      });
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add victim. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewVictim = (victim: Victim) => {
    setViewingVictim(victim);
  };

  const handleEditVictim = (victim: Victim) => {
    setEditingVictim(victim);
  };

  const handleVictimUpdated = (updatedVictim: Victim) => {
    setVictims(prev => prev.map(v => v.id === updatedVictim.id ? updatedVictim : v));
    setEditingVictim(null);
  };

  const handleDeleteVictim = async (victimId: string) => {
    try {
      StorageService.deleteVictim(victimId);
      setVictims(prev => prev.filter(v => v.id !== victimId));
      toast({
        title: "Victim Deleted",
        description: "Victim has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete victim. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredVictims = victims.filter(victim =>
    `${victim.firstName} ${victim.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cases.find(c => c.id === victim.caseId)?.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-background via-background to-card/50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse" />
        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-transparent via-primary to-transparent animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Victim Records Grid */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="victims-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="currentColor" strokeWidth="0.3"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#victims-grid)" className="text-accent" />
        </svg>
      </div>

      {/* Floating Victim Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent/30 rounded-full animate-pulse"
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
                <div className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                <h1 className="font-orbitron text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  VICTIM REGISTRY
                </h1>
              </div>
              <p className="text-muted-foreground font-medium">Victim Information & Support System • Status: PROTECTED</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 animate-fade-in hover:shadow-glow transition-all" style={{ animationDelay: '0.2s' }}>
                  <Plus className="w-4 h-4" />
                  Add Victim
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/50">
                <DialogHeader>
                  <DialogTitle className="font-orbitron">Add New Victim</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First name" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last name" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cnicId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNIC ID</FormLabel>
                          <FormControl>
                            <Input placeholder="XXXXX-XXXXXXX-X" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="Age" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background/50">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="unknown">Unknown</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone number" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Email address" {...field} className="bg-background/50" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Full address" {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Additional notes..." {...field} className="bg-background/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">Add Victim</Button>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Control Panel */}
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-lg p-4 mb-6 shadow-glow animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search victim registry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border/50 hover:border-accent/30 focus:border-accent/60 transition-all"
              />
            </div>
          </div>

          <div className="grid gap-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-orbitron">
                  <Users className="w-5 h-5 text-accent" />
                  VICTIM RECORDS ({filteredVictims.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredVictims.length > 0 ? (
                  <div className="space-y-4">
                    {filteredVictims.map((victim, index) => {
                      const victimCase = cases.find(c => c.id === victim.caseId);
                      return (
                        <div 
                          key={victim.id} 
                          className="flex items-center justify-between p-4 border border-border/30 rounded-lg bg-background/20 hover:bg-accent/5 hover:border-accent/30 transition-all duration-300 group animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                           <div className="flex items-center gap-4">
                             <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center group-hover:shadow-glow transition-all">
                               <User className="w-5 h-5 text-accent" />
                             </div>
                             <div>
                               <h3 className="font-orbitron font-semibold">
                                 {victim.firstName} {victim.lastName}
                               </h3>
                               <div className="text-sm text-muted-foreground font-mono">
                                 Case: {victimCase?.caseNumber || 'Unknown'} • 
                                 Age: {victim.age || 'N/A'} • 
                                 CNIC: {victim.cnicId}
                               </div>
                               {(victim.contactPhone || victim.contactEmail) && (
                                 <div className="text-sm text-muted-foreground">
                                   Contact: {[victim.contactPhone, victim.contactEmail].filter(Boolean).join(' • ')}
                                 </div>
                               )}
                             </div>
                           </div>
                           <div className="flex gap-2">
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleViewVictim(victim)}
                               className="hover:bg-primary/10 hover:border-primary/30"
                             >
                               View
                             </Button>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleEditVictim(victim)}
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
                                   <AlertDialogTitle className="font-orbitron">Delete Victim</AlertDialogTitle>
                                   <AlertDialogDescription>
                                     Are you sure you want to delete this victim? This action cannot be undone.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel>Cancel</AlertDialogCancel>
                                   <AlertDialogAction onClick={() => handleDeleteVictim(victim.id)}>
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
                      <Users className="w-16 h-16 text-muted-foreground mx-auto" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
                    </div>
                    <h3 className="font-orbitron text-xl font-semibold mb-3">
                      {victims.length === 0 ? "VICTIM REGISTRY EMPTY" : "NO MATCHES FOUND"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {victims.length === 0 
                        ? "Initialize your first victim record to begin support documentation" 
                        : "Adjust search parameters to refine registry query results"
                      }
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span className="font-mono">System ready for victim registration</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dialogs */}
          {editingVictim && (
            <VictimEditDialog
              victim={editingVictim}
              cases={cases}
              open={!!editingVictim}
              onOpenChange={(open) => !open && setEditingVictim(null)}
              onVictimUpdated={handleVictimUpdated}
            />
          )}
          
          {viewingVictim && (
            <VictimViewDialog
              victim={viewingVictim}
              cases={cases}
              open={!!viewingVictim}
              onOpenChange={(open) => !open && setViewingVictim(null)}
            />
          )}
        </div>
      </div>

      {/* Corner Accent Glows */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
    </main>
  );
}