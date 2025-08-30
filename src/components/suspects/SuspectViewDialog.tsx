import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Suspect } from "@/types/suspect";
import { User, Calendar, Phone, Mail, MapPin, AlertCircle, FileText, Briefcase } from "lucide-react";

interface SuspectViewDialogProps {
  suspect: Suspect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SuspectViewDialog({ suspect, open, onOpenChange }: SuspectViewDialogProps) {
  const getStatusColor = (status: Suspect['status']): "default" | "destructive" | "outline" | "secondary" => {
    const colors = {
      wanted: "destructive" as const,
      arrested: "secondary" as const,
      released: "outline" as const,
      under_investigation: "default" as const
    };
    return colors[status];
  };

  const getStatusLabel = (status: Suspect['status']) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Suspect Information
          </DialogTitle>
          <DialogDescription>
            View complete suspect profile and investigation details.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                {suspect.firstName} {suspect.lastName}
                {suspect.alias && (
                  <span className="text-lg text-muted-foreground ml-2">
                    aka "{suspect.alias}"
                  </span>
                )}
              </h3>
              {suspect.cnicId && (
                <p className="text-muted-foreground">CNIC: {suspect.cnicId}</p>
              )}
            </div>
            <Badge variant={getStatusColor(suspect.status)}>
              {getStatusLabel(suspect.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suspect.age && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Age: {suspect.age}</span>
              </div>
            )}
            
            {suspect.dateOfBirth && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>DOB: {new Date(suspect.dateOfBirth).toLocaleDateString()}</span>
              </div>
            )}
            
            {suspect.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{suspect.contactPhone}</span>
              </div>
            )}
            
            {suspect.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{suspect.contactEmail}</span>
              </div>
            )}

            {suspect.nationality && (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
                <span>Nationality: {suspect.nationality}</span>
              </div>
            )}

            {suspect.occupation && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>Occupation: {suspect.occupation}</span>
              </div>
            )}
          </div>

          {suspect.address && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{suspect.address}</p>
            </div>
          )}

          {suspect.lastKnownLocation && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Last Known Location
              </h4>
              <p className="text-muted-foreground">{suspect.lastKnownLocation}</p>
            </div>
          )}

          {suspect.description && (
            <div>
              <h4 className="font-medium mb-2">Physical Description</h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{suspect.description}</p>
            </div>
          )}

          {suspect.criminalHistory && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                Criminal History
              </h4>
              <p className="text-muted-foreground bg-destructive/5 p-3 rounded-md border border-destructive/20">
                {suspect.criminalHistory}
              </p>
            </div>
          )}

          {suspect.notes && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </h4>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{suspect.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}