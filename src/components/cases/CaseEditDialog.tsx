import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Case } from "@/types";
import { StorageService } from "@/lib/storage";
import { Save, X } from "lucide-react";

interface CaseEditDialogProps {
  case: Case | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCaseUpdated?: () => void;
}

export function CaseEditDialog({ case: caseData, open, onOpenChange, onCaseUpdated }: CaseEditDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    status: 'open',
    location: '',
    assignedTo: [] as string[],
    estimatedCloseDate: ''
  });

  useEffect(() => {
    if (caseData && open) {
      setFormData({
        title: caseData.title,
        description: caseData.description,
        category: caseData.category,
        priority: caseData.priority,
        status: caseData.status,
        location: caseData.location || '',
        assignedTo: caseData.assignedTo,
        estimatedCloseDate: caseData.estimatedCloseDate ? 
          new Date(caseData.estimatedCloseDate).toISOString().split('T')[0] : ''
      });
    }
  }, [caseData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caseData) return;

    if (!formData.title || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Title and category are required",
        variant: "destructive"
      });
      return;
    }

    const updates = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority as Case['priority'],
      status: formData.status as Case['status'],
      location: formData.location || undefined,
      assignedTo: formData.assignedTo,
      estimatedCloseDate: formData.estimatedCloseDate ? 
        new Date(formData.estimatedCloseDate) : undefined
    };

    try {
      StorageService.updateCase(caseData.id, updates);
      
      // Save audit log
      const auditLogs = JSON.parse(localStorage.getItem('auditLogs') || '[]');
      auditLogs.push({
        id: crypto.randomUUID(),
        userId: localStorage.getItem('currentUser') || 'system',
        action: 'UPDATE_CASE',
        entity: 'case',
        entityId: caseData.id,
        details: { caseNumber: caseData.caseNumber, title: formData.title },
        timestamp: new Date().toISOString(),
        ipAddress: '127.0.0.1'
      });
      localStorage.setItem('auditLogs', JSON.stringify(auditLogs));

      toast({
        title: "Success",
        description: "Case updated successfully"
      });

      onOpenChange(false);
      onCaseUpdated?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update case",
        variant: "destructive"
      });
    }
  };

  if (!caseData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Case</DialogTitle>
          <DialogDescription>
            Update case information and details
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Case Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter case title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Case description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="theft">Theft</SelectItem>
                  <SelectItem value="fraud">Fraud</SelectItem>
                  <SelectItem value="assault">Assault</SelectItem>
                  <SelectItem value="cybercrime">Cybercrime</SelectItem>
                  <SelectItem value="drug_related">Drug Related</SelectItem>
                  <SelectItem value="domestic_violence">Domestic Violence</SelectItem>
                  <SelectItem value="missing_person">Missing Person</SelectItem>
                  <SelectItem value="murder">Murder</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Case location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedCloseDate">Estimated Close Date</Label>
            <Input
              id="estimatedCloseDate"
              type="date"
              value={formData.estimatedCloseDate}
              onChange={(e) => setFormData({ ...formData, estimatedCloseDate: e.target.value })}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Update Case
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}