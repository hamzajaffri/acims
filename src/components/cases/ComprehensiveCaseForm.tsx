import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, FileText, ClipboardList } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StorageService } from "@/lib/storage";
import { AuthService } from "@/lib/auth";
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
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      // Create the main case
      const newCase = StorageService.createCase({
        caseNumber: formData.caseNumber,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assignedTo: formData.assignedTo ? [formData.assignedTo] : [],
        createdBy: currentUser.id,
        location: formData.location,
        category: formData.category,
        estimatedCloseDate: formData.estimatedCloseDate ? new Date(formData.estimatedCloseDate) : undefined,
        casePassword: formData.password
      });

      // Create victims
      for (const victimData of formData.victims) {
        StorageService.createVictim({
          caseId: newCase.id,
          firstName: victimData.firstName,
          lastName: victimData.lastName,
          cnicId: victimData.cnicId,
          age: victimData.age ? parseInt(victimData.age) : undefined,
          gender: victimData.gender,
          contactPhone: victimData.contactPhone,
          contactEmail: victimData.contactEmail,
          address: victimData.address,
          notes: victimData.notes
        });
      }

      // Create evidence
      for (const evidenceData of formData.evidence) {
        StorageService.createEvidence({
          caseId: newCase.id,
          name: evidenceData.name,
          type: evidenceData.type,
          category: evidenceData.category,
          description: evidenceData.description,
          collectedBy: evidenceData.collectedBy,
          collectedAt: new Date(),
          status: "collected",
          tags: [],
          chainOfCustody: [{
            id: `custody-${Date.now()}`,
            handledBy: evidenceData.collectedBy,
            handledAt: new Date(),
            action: "collected",
            notes: evidenceData.notes,
            location: evidenceData.location
          }],
          location: evidenceData.location,
          notes: evidenceData.notes
        });
      }

      // Create reports
      for (const reportData of formData.reports) {
        const reports = JSON.parse(localStorage.getItem('cim_reports') || '[]');
        const newReport = {
          id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          caseId: newCase.id,
          ...reportData,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.id
        };
        reports.push(newReport);
        localStorage.setItem('cim_reports', JSON.stringify(reports));
      }

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