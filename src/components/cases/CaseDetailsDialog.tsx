import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ComprehensiveCaseEditDialog } from "./ComprehensiveCaseEditDialog";
import { 
  Edit, 
  Trash2, 
  Download, 
  Users, 
  FileText, 
  ClipboardList, 
  Calendar,
  MapPin,
  User,
  Hash,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/lib/supabase-service";
import { Case, Victim, Evidence } from "@/types";
import { format } from "date-fns";

interface CaseDetailsDialogProps {
  case: Case | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseUpdated?: () => void;
  onCaseDeleted?: () => void;
}

// Case Edit Button Component
function CaseEditButton({ case: caseData, onCaseUpdated }: { case: Case, onCaseUpdated?: () => void }) {
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <Button onClick={() => setShowEdit(true)} variant="outline" size="sm">
        <Edit className="w-4 h-4 mr-2" />
        Edit
      </Button>
      
      <ComprehensiveCaseEditDialog
        case={caseData}
        open={showEdit}
        onOpenChange={setShowEdit}
        onCaseUpdated={onCaseUpdated}
      />
    </>
  );
}

export function CaseDetailsDialog({ 
  case: caseData, 
  open, 
  onOpenChange, 
  onCaseUpdated, 
  onCaseDeleted 
}: CaseDetailsDialogProps) {
  const [victims, setVictims] = useState<Victim[]>([]);
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (caseData && open) {
      loadCaseData();
    }
  }, [caseData, open]);

  const loadCaseData = async () => {
    if (!caseData) return;
    
    try {
      const [caseVictims, caseEvidence, caseReports] = await Promise.all([
        SupabaseService.getAllVictims(),
        SupabaseService.getAllEvidence(),
        SupabaseService.getAllReports()
      ]);
      
      // Filter by case ID and map to UI types
      const mappedVictims = caseVictims
        .filter(v => v.case_id === caseData.id)
        .map(v => ({
          id: v.id,
          caseId: v.case_id,
          firstName: v.first_name,
          lastName: v.last_name,
          cnicId: v.cnic_id || '',
          age: v.age || undefined,
          gender: v.gender,
          contactPhone: v.contact_phone || undefined,
          contactEmail: v.contact_email || undefined,
          address: v.address || undefined,
          notes: v.notes || undefined,
          createdAt: new Date(v.created_at),
          updatedAt: new Date(v.updated_at)
        }));

      const mappedEvidence = caseEvidence
        .filter(e => e.case_id === caseData.id)
        .map(e => ({
          id: e.id,
          caseId: e.case_id,
          name: e.name,
          type: e.type,
          category: e.category || '',
          description: e.description || undefined,
          fileName: e.file_name || undefined,
          fileSize: e.file_size || undefined,
          fileType: e.file_type || undefined,
          filePath: e.file_path || undefined,
          hash: e.hash || undefined,
          evidenceNumber: e.evidence_number || undefined,
          location: e.location || undefined,
          storageLocation: e.storage_location || undefined,
          chainOfCustody: [],
          collectedBy: e.collected_by,
          collectedAt: new Date(e.collected_at),
          status: e.status,
          tags: e.tags || [],
          notes: e.notes || undefined
        }));

      const mappedReports = caseReports.filter(r => r.case_id === caseData.id);

      setVictims(mappedVictims);
      setEvidence(mappedEvidence);
      setReports(mappedReports);
    } catch (error) {
      console.error('Error loading case data:', error);
    }
  };

  const handleDeleteCase = async () => {
    if (!caseData) return;

    try {
      await SupabaseService.deleteCase(caseData.id);
      
      // Create audit log
      await SupabaseService.createAuditLog({
        action: 'DELETE',
        entity: 'case',
        entity_id: caseData.id,
        details: { caseNumber: caseData.caseNumber, title: caseData.title }
      });
      
      toast({
        title: "Case Deleted",
        description: `Case ${caseData.caseNumber} has been deleted successfully.`,
      });
      onOpenChange(false);
      onCaseDeleted?.();
    } catch (error) {
      console.error('Error deleting case:', error);
      toast({
        title: "Error",
        description: "Failed to delete case",
        variant: "destructive"
      });
    }
  };

  const handleExportCase = () => {
    if (!caseData) return;

    const exportData = {
      case: caseData,
      victims,
      evidence,
      reports,
      exportedAt: new Date().toISOString(),
      exportedBy: "Current User"
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `case-${caseData.caseNumber}-export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Case Exported",
      description: `Case ${caseData.caseNumber} data has been exported successfully.`,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'archived': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{caseData.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4" />
                {caseData.caseNumber}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExportCase} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <CaseEditButton 
                case={caseData} 
                onCaseUpdated={onCaseUpdated}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the case 
                      "{caseData.title}" and all related data including victims, evidence, and reports.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteCase} className="bg-destructive text-destructive-foreground">
                      Delete Case
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </DialogHeader>

        {/* Case Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge className={getPriorityColor(caseData.priority)}>
                  {caseData.priority}
                </Badge>
                <span className="text-sm text-muted-foreground">Priority</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(caseData.status)}>
                  {caseData.status}
                </Badge>
                <span className="text-sm text-muted-foreground">Status</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  {format(caseData.createdAt, 'MMM dd, yyyy')}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{victims.length} Victims</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Case Details</TabsTrigger>
            <TabsTrigger value="victims">Victims ({victims.length})</TabsTrigger>
            <TabsTrigger value="evidence">Evidence ({evidence.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Case Number</label>
                    <p className="font-mono">{caseData.caseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p>{caseData.category}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                    <p>{caseData.assignedTo.length > 0 ? caseData.assignedTo.join(', ') : 'Not assigned'}</p>
                  </div>
                  {caseData.location && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Location</label>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {caseData.location}
                      </p>
                    </div>
                  )}
                </div>
                {caseData.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="mt-1">{caseData.description}</p>
                  </div>
                )}
                {caseData.estimatedCloseDate && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Close Date</label>
                    <p>{format(caseData.estimatedCloseDate, 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="victims" className="space-y-4">
            {victims.length > 0 ? (
              victims.map((victim) => (
                <Card key={victim.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {victim.firstName} {victim.lastName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>CNIC:</strong> {victim.cnicId}</div>
                      <div><strong>Gender:</strong> {victim.gender}</div>
                      {victim.age && <div><strong>Age:</strong> {victim.age}</div>}
                      {victim.contactPhone && <div><strong>Phone:</strong> {victim.contactPhone}</div>}
                      {victim.contactEmail && <div><strong>Email:</strong> {victim.contactEmail}</div>}
                      {victim.address && <div className="col-span-2"><strong>Address:</strong> {victim.address}</div>}
                      {victim.notes && <div className="col-span-2"><strong>Notes:</strong> {victim.notes}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No victims recorded for this case
              </div>
            )}
          </TabsContent>

          <TabsContent value="evidence" className="space-y-4">
            {evidence.length > 0 ? (
              evidence.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Type:</strong> {item.type}</div>
                      <div><strong>Category:</strong> {item.category}</div>
                      <div><strong>Status:</strong> {item.status}</div>
                      <div><strong>Collected By:</strong> {item.collectedBy}</div>
                      <div><strong>Collected At:</strong> {format(item.collectedAt, 'MMM dd, yyyy HH:mm')}</div>
                      {item.location && <div><strong>Location:</strong> {item.location}</div>}
                      {item.description && <div className="col-span-2"><strong>Description:</strong> {item.description}</div>}
                      {item.notes && <div className="col-span-2"><strong>Notes:</strong> {item.notes}</div>}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No evidence recorded for this case
              </div>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            {reports.length > 0 ? (
              reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Type:</strong> {report.type}</div>
                      <div><strong>Priority:</strong> {report.priority}</div>
                      <div><strong>Created:</strong> {format(new Date(report.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                      <div className="col-span-2"><strong>Description:</strong> {report.description}</div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reports created for this case
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}