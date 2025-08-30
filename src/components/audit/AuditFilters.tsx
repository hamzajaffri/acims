import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Filter, Download } from "lucide-react";

export function AuditFilters() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const { toast } = useToast();

  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    user: "",
    action: "",
    level: "all" as "all" | "info" | "warning" | "error" | "critical"
  });

  const [exportSettings, setExportSettings] = useState({
    format: "csv" as "csv" | "pdf" | "json",
    dateRange: "week" as "day" | "week" | "month" | "custom",
    includeDetails: true
  });

  const handleApplyFilters = () => {
    toast({
      title: "Filters Applied",
      description: "Audit logs have been filtered according to your criteria.",
    });
    setFilterOpen(false);
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: `Exporting audit logs as ${exportSettings.format.toUpperCase()}. You'll receive a download link shortly.`,
    });
    setExportOpen(false);
  };

  return (
    <div className="flex gap-2">
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Audit Logs</DialogTitle>
            <DialogDescription>
              Apply filters to narrow down the audit log results.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">From Date</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo">To Date</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                value={filters.user}
                onChange={(e) => setFilters({ ...filters, user: e.target.value })}
                placeholder="Filter by username or ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Input
                id="action"
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                placeholder="e.g., login, case_created, data_accessed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Log Level</Label>
              <Select value={filters.level} onValueChange={(value: "all" | "info" | "warning" | "error" | "critical") => setFilters({ ...filters, level: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setFilterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Audit Logs</DialogTitle>
            <DialogDescription>
              Configure your export settings and download the audit logs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={exportSettings.format} onValueChange={(value: "csv" | "pdf" | "json") => setExportSettings({ ...exportSettings, format: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={exportSettings.dateRange} onValueChange={(value: "day" | "week" | "month" | "custom") => setExportSettings({ ...exportSettings, dateRange: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Last 24 Hours</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="includeDetails">Include Full Details</Label>
                <p className="text-sm text-muted-foreground">Include metadata and additional context</p>
              </div>
              <input
                type="checkbox"
                id="includeDetails"
                checked={exportSettings.includeDetails}
                onChange={(e) => setExportSettings({ ...exportSettings, includeDetails: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setExportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                Export Logs
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}