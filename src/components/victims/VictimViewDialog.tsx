import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Victim, Case } from "@/types";
import { User, Calendar, Phone, Mail, MapPin, FileText } from "lucide-react";

interface VictimViewDialogProps {
  victim: Victim;
  cases: Case[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VictimViewDialog({ victim, cases, open, onOpenChange }: VictimViewDialogProps) {
  const victimCase = cases.find(c => c.id === victim.caseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Victim Information
          </DialogTitle>
          <DialogDescription>
            View complete victim details and case information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                {victim.firstName} {victim.lastName}
              </h3>
              <p className="text-muted-foreground">CNIC: {victim.cnicId}</p>
            </div>
            <Badge variant="secondary">
              {victim.gender.charAt(0).toUpperCase() + victim.gender.slice(1)}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {victim.age && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Age: {victim.age}</span>
              </div>
            )}
            
            {victimCase && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span>Case: {victimCase.caseNumber}</span>
              </div>
            )}
            
            {victim.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{victim.contactPhone}</span>
              </div>
            )}
            
            {victim.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{victim.contactEmail}</span>
              </div>
            )}
          </div>

          {victim.address && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h4>
              <p className="text-muted-foreground">{victim.address}</p>
            </div>
          )}

          {victim.notes && (
            <div>
              <h4 className="font-medium mb-2">Notes</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{victim.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}