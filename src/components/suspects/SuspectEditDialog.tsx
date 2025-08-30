import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StorageService } from "@/lib/storage";
import { Suspect } from "@/types/suspect";
import { Save, X } from "lucide-react";

interface SuspectEditDialogProps {
  suspect: Suspect;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuspectUpdated: (suspect: Suspect) => void;
}

export function SuspectEditDialog({ suspect, open, onOpenChange, onSuspectUpdated }: SuspectEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: suspect.firstName,
    lastName: suspect.lastName,
    alias: suspect.alias || "",
    cnicId: suspect.cnicId || "",
    dateOfBirth: suspect.dateOfBirth || "",
    gender: suspect.gender,
    nationality: suspect.nationality || "",
    address: suspect.address || "",
    contactPhone: suspect.contactPhone || "",
    contactEmail: suspect.contactEmail || "",
    occupation: suspect.occupation || "",
    description: suspect.description || "",
    status: suspect.status,
    lastKnownLocation: suspect.lastKnownLocation || "",
    criminalHistory: suspect.criminalHistory || "",
    notes: suspect.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedSuspectData = {
        ...formData,
        age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : suspect.age,
        dateOfBirth: formData.dateOfBirth || undefined,
      };
      
      const updatedSuspect = StorageService.updateSuspect(suspect.id, updatedSuspectData);
      
      toast({
        title: "Suspect Updated",
        description: "Suspect information has been updated successfully.",
      });
      
      onSuspectUpdated(updatedSuspect);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update suspect. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Suspect Information</DialogTitle>
          <DialogDescription>
            Update suspect details, status, and case information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alias">Alias/Nickname</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cnicId">CNIC Number</Label>
              <Input
                id="cnicId"
                value={formData.cnicId}
                onChange={(e) => setFormData({ ...formData, cnicId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wanted">Wanted</SelectItem>
                  <SelectItem value="arrested">Arrested</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="under_investigation">Under Investigation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastKnownLocation">Last Known Location</Label>
            <Input
              id="lastKnownLocation"
              value={formData.lastKnownLocation}
              onChange={(e) => setFormData({ ...formData, lastKnownLocation: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Physical Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criminalHistory">Criminal History</Label>
            <Textarea
              id="criminalHistory"
              value={formData.criminalHistory}
              onChange={(e) => setFormData({ ...formData, criminalHistory: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Update Suspect
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}