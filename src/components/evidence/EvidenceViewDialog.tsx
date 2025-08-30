import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Evidence, Case } from "@/types";
import { FileText, Calendar, User, MapPin, AlertCircle, Package } from "lucide-react";

interface EvidenceViewDialogProps {
  evidence: Evidence;
  cases: Case[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidenceViewDialog({ evidence, cases, open, onOpenChange }: EvidenceViewDialogProps) {
  const evidenceCase = cases.find(c => c.id === evidence.caseId);

  const getStatusColor = (status: Evidence['status']): "default" | "destructive" | "outline" | "secondary" => {
    const colors = {
      collected: "default" as const,
      processing: "secondary" as const,
      analyzed: "outline" as const,
      archived: "destructive" as const
    };
    return colors[status];
  };

  const getTypeIcon = (type: Evidence['type']) => {
    return type === 'digital' ? FileText : Package;
  };

  const TypeIcon = getTypeIcon(evidence.type);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TypeIcon className="w-5 h-5" />
            Evidence Information
          </DialogTitle>
          <DialogDescription>
            View complete evidence details and chain of custody records.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold">{evidence.name}</h3>
              <p className="text-muted-foreground">{evidence.category}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={getStatusColor(evidence.status)}>
                {evidence.status.charAt(0).toUpperCase() + evidence.status.slice(1)}
              </Badge>
              <Badge variant="outline">
                {evidence.type.charAt(0).toUpperCase() + evidence.type.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evidenceCase && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Case: {evidenceCase.caseNumber}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Collected: {evidence.collectedAt.toLocaleDateString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>Collected by: {evidence.collectedBy}</span>
            </div>
            
            {evidence.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Location: {evidence.location}</span>
              </div>
            )}
          </div>

          {evidence.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{evidence.description}</p>
            </div>
          )}

          {evidence.tags && evidence.tags.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {evidence.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          )}

          {evidence.chainOfCustody && evidence.chainOfCustody.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Chain of Custody
              </h4>
              <div className="space-y-2">
                {evidence.chainOfCustody.map((entry) => (
                  <div key={entry.id} className="border-l-2 border-muted pl-4 pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}</span>
                      <span className="text-sm text-muted-foreground">
                        {entry.handledAt.toLocaleDateString()} {entry.handledAt.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Handled by: {entry.handledBy}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                    )}
                    {entry.location && (
                      <p className="text-sm text-muted-foreground">Location: {entry.location}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {evidence.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{evidence.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}