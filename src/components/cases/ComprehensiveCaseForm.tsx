import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, FileText, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/lib/supabase-service";
import { useSupabase } from "@/hooks/useSupabase";
import { Case, Victim, Evidence } from "@/types";

import { BasicCaseInfo } from "./sections/BasicCaseInfo";
import { VictimSection } from "./sections/VictimSection";
import { EvidenceSection } from "./sections/EvidenceSection";
import { ReportSection } from "./sections/ReportSection";

interface ComprehensiveCaseFormProps {
  onCaseCreated?: (newCase: Case) => void;
}

export interface CaseFormData {
  // Basic Case Info
  caseNumber: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "active" | "closed" | "archived";
  assignedTo: string;
  location: string;
  category: string;
  estimatedCloseDate: string;
  password: string;
  
  // Victims
  victims: Array<{
    firstName: string;
    lastName: string;
    cnicId: string;
    age?: string;
    gender: "male" | "female" | "other" | "unknown";
    contactPhone?: string;
    contactEmail?: string;
    address?: string;
    notes?: string;
  }>;
  
  // Evidence
  evidence: Array<{
    name: string;
    type: "digital" | "physical";
    category: string;
    description?: string;
    collectedBy: string;
    location?: string;
    notes?: string;
  }>;
  
  // Reports
  reports: Array<{
    title: string;
    description: string;
    type: "investigation" | "incident" | "summary" | "forensic";
    priority: "low" | "medium" | "high";
  }>;
}

export function ComprehensiveCaseForm({ onCaseCreated }: ComprehensiveCaseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const { user } = useSupabase();

  const [formData, setFormData] = useState<CaseFormData>({
    caseNumber: "",
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    assignedTo: "",
    location: "",
    category: "",
    estimatedCloseDate: "",
    password: "",
    victims: [],
    evidence: [],
    reports: []
  });

  const updateFormData = (section: keyof CaseFormData, data: any) => {
    setFormData(prev => ({ ...prev, [section]: data }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const currentUser = user;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Create the main case
      const dbPayload: any = {
        case_number: formData.caseNumber,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigned_to: [],
        location: formData.location || null,
        category: formData.category,
        estimated_close_date: formData.estimatedCloseDate || null,
        case_password: formData.password || null,
      };

      const newCaseDb = await SupabaseService.createCase(dbPayload);

      // Create victims
      for (const victimData of formData.victims) {
        await SupabaseService.createVictim({
          case_id: newCaseDb.id,
          first_name: victimData.firstName,
          last_name: victimData.lastName,
          cnic_id: victimData.cnicId,
          age: victimData.age ? parseInt(victimData.age) : null,
          gender: victimData.gender,
          contact_phone: victimData.contactPhone || null,
          contact_email: victimData.contactEmail || null,
          address: victimData.address || null,
          notes: victimData.notes || null
        });
      }

      // Create evidence
      for (const evidenceData of formData.evidence) {
        await SupabaseService.createEvidence({
          case_id: newCaseDb.id,
          name: evidenceData.name,
          type: evidenceData.type,
          category: evidenceData.category,
          description: evidenceData.description || null,
          location: evidenceData.location || null,
          notes: evidenceData.notes || null
        });
      }

      // Create reports
      for (const reportData of formData.reports) {
        await SupabaseService.createReport({
          case_id: newCaseDb.id,
          title: reportData.title,
          content: reportData.description,
          report_type: reportData.type,
        });
      }

      // Convert DB case to UI format
      const newCase: Case = {
        id: newCaseDb.id,
        caseNumber: newCaseDb.case_number,
        title: newCaseDb.title,
        description: newCaseDb.description ?? "",
        status: newCaseDb.status,
        priority: newCaseDb.priority,
        assignedTo: Array.isArray(newCaseDb.assigned_to) ? newCaseDb.assigned_to : [],
        createdBy: newCaseDb.created_by,
        createdAt: newCaseDb.created_at ? new Date(newCaseDb.created_at) : new Date(),
        updatedAt: newCaseDb.updated_at ? new Date(newCaseDb.updated_at) : new Date(),
        casePassword: newCaseDb.case_password ?? undefined,
        location: newCaseDb.location ?? undefined,
        category: newCaseDb.category ?? "",
        estimatedCloseDate: newCaseDb.estimated_close_date ? new Date(newCaseDb.estimated_close_date) : undefined,
        actualCloseDate: newCaseDb.actual_close_date ? new Date(newCaseDb.actual_close_date) : undefined,
      };

      toast({
        title: "Case Created Successfully",
        description: `Case ${newCase.caseNumber} with all related data has been created.`,
      });

      // Reset form
      setFormData({
        caseNumber: "",
        title: "",
        description: "",
        priority: "medium",
        status: "open",
        assignedTo: "",
        location: "",
        category: "",
        estimatedCloseDate: "",
        password: "",
        victims: [],
        evidence: [],
        reports: []
      });

      setOpen(false);
      setActiveTab("basic");
      onCaseCreated?.(newCase);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create case",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const canProceedToNext = () => {
    if (activeTab === "basic") {
      return formData.caseNumber && formData.title && formData.category;
    }
    return true;
  };

  const getTabCounts = () => ({
    victims: formData.victims.length,
    evidence: formData.evidence.length,
    reports: formData.reports.length
  });

  const tabCounts = getTabCounts();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Comprehensive Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Comprehensive Case</DialogTitle>
          <DialogDescription>
            Create a complete case with all related information including victims, evidence, and reports.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="victims" className="gap-2">
              <Users className="w-4 h-4" />
              Victims {tabCounts.victims > 0 && `(${tabCounts.victims})`}
            </TabsTrigger>
            <TabsTrigger value="evidence" className="gap-2">
              <FileText className="w-4 h-4" />
              Evidence {tabCounts.evidence > 0 && `(${tabCounts.evidence})`}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Reports {tabCounts.reports > 0 && `(${tabCounts.reports})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <BasicCaseInfo 
              data={{
                caseNumber: formData.caseNumber,
                title: formData.title,
                description: formData.description,
                priority: formData.priority,
                status: formData.status,
                assignedTo: formData.assignedTo,
                location: formData.location,
                category: formData.category,
                estimatedCloseDate: formData.estimatedCloseDate,
                password: formData.password
              }}
              onChange={(data) => setFormData(prev => ({ ...prev, ...data }))}
              onUpdate={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
            />
          </TabsContent>

          <TabsContent value="victims" className="space-y-4">
            <VictimSection 
              victims={formData.victims}
              onChange={(victims) => updateFormData("victims", victims)}
            />
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            <EvidenceSection 
              evidence={formData.evidence}
              onChange={(evidence) => updateFormData("evidence", evidence)}
            />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportSection 
              reports={formData.reports}
              onChange={(reports) => updateFormData("reports", reports)}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between gap-2 pt-4 border-t">
          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic", "victims", "evidence", "reports"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Previous
              </Button>
            )}
            {activeTab !== "reports" && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "victims", "evidence", "reports"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
                disabled={!canProceedToNext()}
              >
                Next
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !canProceedToNext()}>
              {loading ? "Creating..." : "Create Complete Case"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}