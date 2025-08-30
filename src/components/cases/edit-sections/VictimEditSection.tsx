import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Users, Edit, Save, X } from "lucide-react";
import { Victim } from "@/types";
import { StorageService } from "@/lib/storage";

interface VictimEditSectionProps {
  caseId: string;
}

export function VictimEditSection({ caseId }: VictimEditSectionProps) {
  const [victims, setVictims] = useState<Victim[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVictim, setEditingVictim] = useState<Victim | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    cnicId: "",
    age: "",
    gender: "unknown" as Victim['gender'],
    contactPhone: "",
    contactEmail: "",
    address: "",
    notes: ""
  });

  useEffect(() => {
    loadVictims();
  }, [caseId]);

  const loadVictims = () => {
    const caseVictims = StorageService.getVictimsByCaseId(caseId);
    setVictims(caseVictims);
  };

  const resetForm = () => {
    setFormData({
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
    setEditingVictim(null);
    setShowForm(false);
  };

  const handleEdit = (victim: Victim) => {
    setFormData({
      firstName: victim.firstName,
      lastName: victim.lastName,
      cnicId: victim.cnicId,
      age: victim.age?.toString() || "",
      gender: victim.gender,
      contactPhone: victim.contactPhone || "",
      contactEmail: victim.contactEmail || "",
      address: victim.address || "",
      notes: victim.notes || ""
    });
    setEditingVictim(victim);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.cnicId) {
      toast({
        title: "Validation Error",
        description: "First name, last name, and CNIC are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingVictim) {
        // Update existing victim
        StorageService.updateVictim(editingVictim.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          cnicId: formData.cnicId,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          contactPhone: formData.contactPhone || undefined,
          contactEmail: formData.contactEmail || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined
        });
        toast({
          title: "Success",
          description: "Victim updated successfully"
        });
      } else {
        // Create new victim
        StorageService.createVictim({
          caseId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          cnicId: formData.cnicId,
          age: formData.age ? parseInt(formData.age) : undefined,
          gender: formData.gender,
          contactPhone: formData.contactPhone || undefined,
          contactEmail: formData.contactEmail || undefined,
          address: formData.address || undefined,
          notes: formData.notes || undefined
        });
        toast({
          title: "Success",
          description: "Victim added successfully"
        });
      }
      
      loadVictims();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save victim",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (victimId: string) => {
    try {
      StorageService.deleteVictim(victimId);
      loadVictims();
      toast({
        title: "Success",
        description: "Victim removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove victim",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          Case Victims ({victims.length})
        </h3>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Victim
        </Button>
      </div>

      {/* Existing Victims */}
      {victims.map((victim) => (
        <Card key={victim.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {victim.firstName} {victim.lastName}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(victim)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(victim.id)}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
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

      {victims.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Victims Added</h3>
            <p className="text-muted-foreground mb-4">
              Add victim information to this case
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Victim
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Victim Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingVictim ? "Edit Victim" : "Add New Victim"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                    value={formData.cnicId}
                    onChange={(e) => setFormData({ ...formData, cnicId: e.target.value })}
                    placeholder="XXXXX-XXXXXXX-X"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value: Victim['gender']) => setFormData({ ...formData, gender: value })}>
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
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about the victim"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingVictim ? "Update Victim" : "Add Victim"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
