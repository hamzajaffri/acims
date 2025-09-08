import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SupabaseService } from "@/lib/supabase-service";
import { useSupabase } from "@/hooks/useSupabase";
import { Case } from "@/types";
import { Plus } from "lucide-react";

interface CaseFormProps {
  onCaseCreated?: (newCase: Case) => void;
}

export function CaseForm({ onCaseCreated }: CaseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useSupabase();

  const [formData, setFormData] = useState({
    caseNumber: "",
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    status: "open" as "open" | "active" | "closed" | "archived",
    assignedTo: "",
    location: "",
    category: "",
    estimatedCloseDate: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const currentUser = user;
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const dbPayload: any = {
        case_number: formData.caseNumber,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status,
        assigned_to: [],
        location: formData.location || null,
        category: formData.category,
        estimated_close_date: formData.estimatedCloseDate || null,
        case_password: formData.password || null,
      };

      const newCaseDb = await SupabaseService.createCase(dbPayload);

      const newCase: Case = {
        id: newCaseDb.id,
        caseNumber: newCaseDb.case_number,
        title: newCaseDb.title,
        description: newCaseDb.description ?? "",
        status: newCaseDb.status,
        priority: newCaseDb.priority,
        assignedTo: Array.isArray(newCaseDb.assigned_to) ? newCaseDb.assigned_to : [],
        createdBy: newCaseDb.created_by,
        createdAt: newCaseDb.created_at ? new Date(newCaseDb.created_at) : new Date(),
        updatedAt: newCaseDb.updated_at ? new Date(newCaseDb.updated_at) : new Date(),
        casePassword: newCaseDb.case_password ?? undefined,
        location: newCaseDb.location ?? undefined,
        category: newCaseDb.category ?? "",
        estimatedCloseDate: newCaseDb.estimated_close_date ? new Date(newCaseDb.estimated_close_date) : undefined,
        actualCloseDate: newCaseDb.actual_close_date ? new Date(newCaseDb.actual_close_date) : undefined,
      };

      toast({
        title: "Case Created",
        description: `Case ${newCase.caseNumber} has been created successfully.`,
      });

      // Reset form
      setFormData({
        caseNumber: "",
        title: "",
        description: "",
        priority: "medium",
        status: "open",
        assignedTo: "",
        location: "",
        category: "",
        estimatedCloseDate: "",
        password: ""
      });

      setOpen(false);
      onCaseCreated?.(newCase);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create case",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Case
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Case</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new investigation case.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseNumber">Case Number</Label>
              <Input
                id="caseNumber"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                placeholder="e.g., CASE-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Officer name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Case Portal Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Password for investigator access"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief case description"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed case description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: "low" | "medium" | "high" | "critical") => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "open" | "active" | "closed" | "archived") => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="estimatedCloseDate">Est. Close Date</Label>
              <Input
                id="estimatedCloseDate"
                type="date"
                value={formData.estimatedCloseDate}
                onChange={(e) => setFormData({ ...formData, estimatedCloseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Theft, Fraud, Assault"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Investigation location"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Case"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}