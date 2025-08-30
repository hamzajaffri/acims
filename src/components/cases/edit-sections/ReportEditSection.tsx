import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileText, Edit, Save, X } from "lucide-react";
import { AuthService } from "@/lib/auth";

interface Report {
  id: string;
  caseId: string;
  title: string;
  description: string;
  type: "investigation" | "incident" | "summary" | "forensic";
  priority: "low" | "medium" | "high";
  createdAt: string;
  createdBy: string;
}

interface ReportEditSectionProps {
  caseId: string;
}

export function ReportEditSection({ caseId }: ReportEditSectionProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "investigation" as Report['type'],
    priority: "medium" as Report['priority']
  });

  useEffect(() => {
    loadReports();
  }, [caseId]);

  const loadReports = () => {
    const allReports = JSON.parse(localStorage.getItem('cim_reports') || '[]');
    const caseReports = allReports.filter((report: Report) => report.caseId === caseId);
    setReports(caseReports);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "investigation",
      priority: "medium"
    });
    setEditingReport(null);
    setShowForm(false);
  };

  const handleEdit = (report: Report) => {
    setFormData({
      title: report.title,
      description: report.description,
      type: report.type,
      priority: report.priority
    });
    setEditingReport(report);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Title and description are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const allReports = JSON.parse(localStorage.getItem('cim_reports') || '[]');

      if (editingReport) {
        // Update existing report
        const reportIndex = allReports.findIndex((r: Report) => r.id === editingReport.id);
        if (reportIndex !== -1) {
          allReports[reportIndex] = {
            ...allReports[reportIndex],
            title: formData.title,
            description: formData.description,
            type: formData.type,
            priority: formData.priority
          };
        }
        toast({
          title: "Success",
          description: "Report updated successfully"
        });
      } else {
        // Create new report
        const newReport: Report = {
          id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          caseId,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          priority: formData.priority,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.id
        };
        allReports.push(newReport);
        toast({
          title: "Success",
          description: "Report added successfully"
        });
      }

      localStorage.setItem('cim_reports', JSON.stringify(allReports));
      loadReports();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save report",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (reportId: string) => {
    try {
      const allReports = JSON.parse(localStorage.getItem('cim_reports') || '[]');
      const filteredReports = allReports.filter((r: Report) => r.id !== reportId);
      localStorage.setItem('cim_reports', JSON.stringify(filteredReports));
      loadReports();
      toast({
        title: "Success",
        description: "Report removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove report",
        variant: "destructive"
      });
    }
  };

  const getTypeLabel = (type: Report['type']) => {
    const labels = {
      investigation: "Investigation",
      incident: "Incident",
      summary: "Summary",
      forensic: "Forensic"
    };
    return labels[type];
  };

  const getPriorityColor = (priority: Report['priority']) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800"
    };
    return colors[priority];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Case Reports ({reports.length})
        </h3>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Report
        </Button>
      </div>

      {/* Existing Reports */}
      {reports.map((report) => (
        <Card key={report.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{report.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(report)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(report.id)}
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
            <div className="space-y-2">
              <div className="flex gap-4 text-sm">
                <span className="font-medium">Type:</span>
                <span>{getTypeLabel(report.type)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                  {report.priority.toUpperCase()}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Created:</span> {new Date(report.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Description:</span>
                <p className="mt-1 text-muted-foreground">{report.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {reports.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Reports Added</h3>
            <p className="text-muted-foreground mb-4">
              Add investigation reports to this case
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Report
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Report Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingReport ? "Edit Report" : "Add New Report"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Report Title *</Label>
                <Input
                  id="reportTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter report title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription">Description *</Label>
                <Textarea
                  id="reportDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed report description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={formData.type} onValueChange={(value: Report['type']) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="investigation">Investigation</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="forensic">Forensic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportPriority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: Report['priority']) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingReport ? "Update Report" : "Add Report"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
