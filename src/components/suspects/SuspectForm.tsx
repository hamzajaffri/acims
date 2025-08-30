import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Save, X } from "lucide-react";
import { Suspect } from "@/types/suspect";
import { StorageService } from "@/lib/storage";

interface SuspectFormProps {
  caseId: string;
  onSuspectAdded?: (suspect: Suspect) => void;
  onCancel?: () => void;
}

export function SuspectForm({ caseId, onSuspectAdded, onCancel }: SuspectFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    alias: '',
    cnicId: '',
    dateOfBirth: '',
    gender: 'unknown' as Suspect['gender'],
    nationality: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    occupation: '',
    description: '',
    status: 'under_investigation' as Suspect['status'],
    lastKnownLocation: '',
    criminalHistory: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Suspect form submitted:', formData);
    
    if (!formData.firstName || !formData.lastName) {
      toast({
        title: "Validation Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    const suspectData = {
      caseId,
      ...formData,
      age: formData.dateOfBirth ? new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear() : undefined,
      createdBy: localStorage.getItem('currentUser') || 'system'
    };

    console.log('Creating suspect with data:', suspectData);

    try {
      const newSuspect = StorageService.createSuspect(suspectData);
      console.log('Suspect created successfully:', newSuspect);

      toast({
        title: "Success",
        description: "Suspect added successfully"
      });

      if (onSuspectAdded) {
        onSuspectAdded(newSuspect);
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        alias: '',
        cnicId: '',
        dateOfBirth: '',
        gender: 'unknown',
        nationality: '',
        address: '',
        contactPhone: '',
        contactEmail: '',
        occupation: '',
        description: '',
        status: 'under_investigation',
        lastKnownLocation: '',
        criminalHistory: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating suspect:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create suspect",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add Suspect Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="alias">Alias/Nickname</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                placeholder="Known as"
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
                placeholder="XXXXX-XXXXXXX-X"
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
              <Select value={formData.gender} onValueChange={(value: Suspect['gender']) => setFormData({ ...formData, gender: value })}>
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
              <Select value={formData.status} onValueChange={(value: Suspect['status']) => setFormData({ ...formData, status: value })}>
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
                placeholder="e.g., Pakistani"
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
                placeholder="+92 XXX XXXXXXX"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              placeholder="Current occupation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Current residential address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastKnownLocation">Last Known Location</Label>
            <Input
              id="lastKnownLocation"
              value={formData.lastKnownLocation}
              onChange={(e) => setFormData({ ...formData, lastKnownLocation: e.target.value })}
              placeholder="Where was the suspect last seen?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Physical Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Height, weight, identifying marks, etc."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criminalHistory">Criminal History</Label>
            <Textarea
              id="criminalHistory"
              value={formData.criminalHistory}
              onChange={(e) => setFormData({ ...formData, criminalHistory: e.target.value })}
              placeholder="Previous offenses, arrests, convictions..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any other relevant information"
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Add Suspect
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}