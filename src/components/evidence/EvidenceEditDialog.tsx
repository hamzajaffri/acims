import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StorageService } from "@/lib/storage";
import { Evidence, Case } from "@/types";
import { Save, X } from "lucide-react";

interface EvidenceEditDialogProps {
  evidence: Evidence;
  cases: Case[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEvidenceUpdated: (evidence: Evidence) => void;
}

export function EvidenceEditDialog({ evidence, cases, open, onOpenChange, onEvidenceUpdated }: EvidenceEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: evidence.name,
    description: evidence.description || "",
    type: evidence.type,
    category: evidence.category,
    caseId: evidence.caseId,
    location: evidence.location || "",
    collectedBy: evidence.collectedBy,
    status: evidence.status,
    notes: evidence.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const updatedEvidence = StorageService.updateEvidence(evidence.id, formData);
      
      toast({
        title: "Evidence Updated",
        description: "Evidence information has been updated successfully.",
      });
      
      onEvidenceUpdated(updatedEvidence);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update evidence. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Evidence Information</DialogTitle>
          <DialogDescription>
            Update evidence details, status, and chain of custody information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Evidence Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Evidence Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Case</Label>
            <Select value={formData.caseId} onValueChange={(value) => setFormData({ ...formData, caseId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((caseItem) => (
                  <SelectItem key={caseItem.id} value={caseItem.id}>
                    {caseItem.caseNumber} - {caseItem.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Collection Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collectedBy">Collected By</Label>
            <Input
              id="collectedBy"
              value={formData.collectedBy}
              onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Update Evidence
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}