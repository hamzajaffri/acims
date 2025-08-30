import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Archive, Eye, Download, Trash2, Calendar, User, Hash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

export function ReportsList() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const storedReports = JSON.parse(localStorage.getItem('cim_reports') || '[]');
    setReports(storedReports);
  };

  const handleDelete = (reportId: string) => {
    const filteredReports = reports.filter(r => r.id !== reportId);
    localStorage.setItem('cim_reports', JSON.stringify(filteredReports));
    setReports(filteredReports);
    toast({
      title: "Report Deleted",
      description: "Report has been successfully deleted.",
    });
  };

  const handleDownload = (report: Report) => {
    // Create a text file with report details
    const reportContent = `
INVESTIGATION REPORT
====================

Report ID: ${report.id}
Case ID: ${report.caseId}
Type: ${report.type.toUpperCase()}
Priority: ${report.priority.toUpperCase()}
Created: ${new Date(report.createdAt).toLocaleString()}
Created By: ${report.createdBy}

Title: ${report.title}

Description:
${report.description}

====================
Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Downloaded",
      description: `Report "${report.title}" has been downloaded.`,
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'investigation': return 'default';
      case 'incident': return 'destructive';
      case 'summary': return 'secondary';
      case 'forensic': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (reports.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Generated Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground">Reports created with cases will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {report.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant={getTypeBadgeVariant(report.type)}>
                      {report.type}
                    </Badge>
                    <Badge variant={getPriorityBadgeVariant(report.priority)}>
                      {report.priority} priority
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedReport(report);
                      setViewOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDownload(report)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(report.id)}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {report.description}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Case: {report.caseId}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(report.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {report.createdBy}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Report Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              Report Details
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Report ID</p>
                    <p className="text-sm">{selectedReport.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Case ID</p>
                    <p className="text-sm">{selectedReport.caseId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <Badge variant={getTypeBadgeVariant(selectedReport.type)}>
                      {selectedReport.type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <Badge variant={getPriorityBadgeVariant(selectedReport.priority)}>
                      {selectedReport.priority}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created By</p>
                    <p className="text-sm">{selectedReport.createdBy}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}