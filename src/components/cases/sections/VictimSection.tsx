import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Users } from "lucide-react";

interface VictimData {
  firstName: string;
  lastName: string;
  cnicId: string;
  age?: string;
  gender: "male" | "female" | "other" | "unknown";
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  notes?: string;
}

interface VictimSectionProps {
  victims: VictimData[];
  onChange: (victims: VictimData[]) => void;
}

export function VictimSection({ victims, onChange }: VictimSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentVictim, setCurrentVictim] = useState<VictimData>({
    firstName: "",
    lastName: "",
    cnicId: "",
    age: "",
    gender: "unknown",
    contactPhone: "",
    contactEmail: "",
    address: "",
    notes: ""
  });

  const handleAddVictim = () => {
    if (currentVictim.firstName && currentVictim.lastName && currentVictim.cnicId) {
      onChange([...victims, currentVictim]);
      setCurrentVictim({
        firstName: "",
        lastName: "",
        cnicId: "",
        age: "",
        gender: "unknown",
        contactPhone: "",
        contactEmail: "",
        address: "",
        notes: ""
      });
      setShowForm(false);
    }
  };

  const handleRemoveVictim = (index: number) => {
    const updatedVictims = victims.filter((_, i) => i !== index);
    onChange(updatedVictims);
  };

  const updateCurrentVictim = (field: keyof VictimData, value: string) => {
    setCurrentVictim(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Victims ({victims.length})
        </h3>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Victim
        </Button>
      </div>

      {/* Existing Victims */}
      {victims.map((victim, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {victim.firstName} {victim.lastName}
              </CardTitle>
              <Button
                onClick={() => handleRemoveVictim(index)}
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
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
      ))}

      {/* Add Victim Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Victim</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={currentVictim.firstName}
                  onChange={(e) => updateCurrentVictim("firstName", e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={currentVictim.lastName}
                  onChange={(e) => updateCurrentVictim("lastName", e.target.value)}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnicId">CNIC/ID *</Label>
                <Input
                  id="cnicId"
                  value={currentVictim.cnicId}
                  onChange={(e) => updateCurrentVictim("cnicId", e.target.value)}
                  placeholder="XXXXX-XXXXXXX-X"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={currentVictim.age}
                  onChange={(e) => updateCurrentVictim("age", e.target.value)}
                  placeholder="Age"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={currentVictim.gender} onValueChange={(value: "male" | "female" | "other" | "unknown") => updateCurrentVictim("gender", value)}>
                  <SelectTrigger>
                    <SelectValue />
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={currentVictim.contactPhone}
                  onChange={(e) => updateCurrentVictim("contactPhone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={currentVictim.contactEmail}
                  onChange={(e) => updateCurrentVictim("contactEmail", e.target.value)}
                  placeholder="Email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={currentVictim.address}
                onChange={(e) => updateCurrentVictim("address", e.target.value)}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={currentVictim.notes}
                onChange={(e) => updateCurrentVictim("notes", e.target.value)}
                placeholder="Additional notes about the victim"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddVictim} disabled={!currentVictim.firstName || !currentVictim.lastName || !currentVictim.cnicId}>
                Add Victim
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
