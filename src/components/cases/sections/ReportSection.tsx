import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ClipboardList } from "lucide-react";

interface ReportData {
  title: string;
  description: string;
  type: "investigation" | "incident" | "summary" | "forensic";
  priority: "low" | "medium" | "high";
}

interface ReportSectionProps {
  reports: ReportData[];
  onChange: (reports: ReportData[]) => void;
}

export function ReportSection({ reports, onChange }: ReportSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [currentReport, setCurrentReport] = useState<ReportData>({
    title: "",
    description: "",
    type: "investigation",
    priority: "medium"
  });

  const handleAddReport = () => {
    if (currentReport.title && currentReport.description) {
      onChange([...reports, currentReport]);
      setCurrentReport({
        title: "",
        description: "",
        type: "investigation",
        priority: "medium"
      });
      setShowForm(false);
    }
  };

  const handleRemoveReport = (index: number) => {
    const updatedReports = reports.filter((_, i) => i !== index);
    onChange(updatedReports);
  };

  const updateCurrentReport = (field: keyof ReportData, value: string) => {
    setCurrentReport(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          Reports ({reports.length})
        </h3>
        <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Report
        </Button>
      </div>

      {/* Existing Reports */}
      {reports.map((report, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{report.title}</CardTitle>
              <Button
                onClick={() => handleRemoveReport(index)}
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
              <div><strong>Type:</strong> {report.type}</div>
              <div><strong>Priority:</strong> {report.priority}</div>
              <div className="col-span-2"><strong>Description:</strong> {report.description}</div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Report Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportTitle">Report Title *</Label>
              <Input
                id="reportTitle"
                value={currentReport.title}
                onChange={(e) => updateCurrentReport("title", e.target.value)}
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reportDescription">Description *</Label>
              <Textarea
                id="reportDescription"
                value={currentReport.description}
                onChange={(e) => updateCurrentReport("description", e.target.value)}
                placeholder="Detailed report description"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={currentReport.type} onValueChange={(value: "investigation" | "incident" | "summary" | "forensic") => updateCurrentReport("type", value)}>
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
                <Select value={currentReport.priority} onValueChange={(value: "low" | "medium" | "high") => updateCurrentReport("priority", value)}>
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

            <div className="flex gap-2">
              <Button onClick={handleAddReport} disabled={!currentReport.title || !currentReport.description}>
                Add Report
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
