import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Suspect } from "@/types/suspect";
import { StorageService } from "@/lib/storage";
import { UserX, MapPin, Phone, Mail, Calendar, AlertCircle } from "lucide-react";

interface SuspectsListProps {
  caseId?: string;
}

export function SuspectsList({ caseId }: SuspectsListProps) {
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSuspects();
  }, [caseId]);

  const loadSuspects = () => {
    const filteredSuspects = caseId 
      ? StorageService.getSuspectsByCaseId(caseId)
      : StorageService.getAllSuspects();
    setSuspects(filteredSuspects);
  };

  const getStatusColor = (status: Suspect['status']) => {
    const colors = {
      wanted: "bg-destructive/10 text-destructive",
      arrested: "bg-orange-100 text-orange-800",
      released: "bg-green-100 text-green-800",
      under_investigation: "bg-blue-100 text-blue-800"
    };
    return colors[status];
  };

  const getStatusLabel = (status: Suspect['status']) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleDelete = (suspectId: string) => {
    try {
      StorageService.deleteSuspect(suspectId);
      loadSuspects();
      toast({
        title: "Suspect Removed",
        description: "Suspect has been removed from the case"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove suspect",
        variant: "destructive"
      });
    }
  };

  if (suspects.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <UserX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Suspects Added</h3>
          <p className="text-muted-foreground">
            Add suspects to track individuals under investigation
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Suspects ({suspects.length})</h3>
      </div>

      <div className="grid gap-4">
        {suspects.map((suspect) => (
          <Card key={suspect.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold">
                    {suspect.firstName} {suspect.lastName}
                    {suspect.alias && (
                      <span className="text-muted-foreground ml-2">
                        aka "{suspect.alias}"
                      </span>
                    )}
                  </h4>
                  <Badge className={getStatusColor(suspect.status)}>
                    {getStatusLabel(suspect.status)}
                  </Badge>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(suspect.id)}
                >
                  Remove
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {suspect.cnicId && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span>CNIC: {suspect.cnicId}</span>
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
                
                {suspect.lastKnownLocation && (
                  <div className="flex items-center gap-2 md:col-span-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>Last seen: {suspect.lastKnownLocation}</span>
                  </div>
                )}
              </div>

              {suspect.description && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Physical Description:</p>
                  <p className="text-sm text-muted-foreground">{suspect.description}</p>
                </div>
              )}

              {suspect.criminalHistory && (
                <div className="mt-4 p-3 bg-destructive/5 rounded-md">
                  <p className="text-sm font-medium mb-1">Criminal History:</p>
                  <p className="text-sm text-muted-foreground">{suspect.criminalHistory}</p>
                </div>
              )}

              {suspect.notes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Notes:</p>
                  <p className="text-sm text-muted-foreground">{suspect.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}