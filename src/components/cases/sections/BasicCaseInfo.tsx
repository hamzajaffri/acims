import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicCaseInfoData {
  caseNumber: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "active" | "closed" | "archived";
  assignedTo: string;
  location: string;
  category: string;
  estimatedCloseDate: string;
  password: string;
}

interface BasicCaseInfoProps {
  data: BasicCaseInfoData;
  onChange: (data: BasicCaseInfoData) => void;
  onUpdate: (field: string, value: any) => void;
}

export function BasicCaseInfo({ data, onUpdate }: BasicCaseInfoProps) {
  const handleChange = (field: keyof BasicCaseInfoData, value: string) => {
    onUpdate(field, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Case Number *</Label>
          <Input
            id="caseNumber"
            value={data.caseNumber}
            onChange={(e) => handleChange("caseNumber", e.target.value)}
            placeholder="e.g., CASE-2024-001"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Input
            id="assignedTo"
            value={data.assignedTo}
            onChange={(e) => handleChange("assignedTo", e.target.value)}
            placeholder="Officer name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleChange("title", e.target.value)}
          placeholder="Brief case description"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Detailed case description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={data.priority} onValueChange={(value: "low" | "medium" | "high" | "critical") => handleChange("priority", value)}>
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
          <Select value={data.status} onValueChange={(value: "open" | "active" | "closed" | "archived") => handleChange("status", value)}>
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
            value={data.estimatedCloseDate}
            onChange={(e) => handleChange("estimatedCloseDate", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={data.category}
            onChange={(e) => handleChange("category", e.target.value)}
            placeholder="e.g., Theft, Fraud, Assault"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="Investigation location"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Case Portal Password</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => handleChange("password", e.target.value)}
          placeholder="Password for investigator access"
        />
      </div>
    </div>
  );
}