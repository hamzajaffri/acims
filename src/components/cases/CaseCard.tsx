import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Case } from "@/types";
import { Calendar, MapPin, User, Eye } from "lucide-react";
import { format } from "date-fns";
import { CaseDetailsDialog } from "./CaseDetailsDialog";

interface CaseCardProps {
  case: Case;
  onViewCase?: (caseId: string) => void;
  onCaseUpdated?: () => void;
  onCaseDeleted?: () => void;
}

export function CaseCard({ case: caseItem, onViewCase, onCaseUpdated, onCaseDeleted }: CaseCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "active": return "default";
      case "closed": return "secondary";
      case "archived": return "outline";
      default: return "default";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{caseItem.caseNumber}</h3>
              <Badge variant={getPriorityColor(caseItem.priority)}>{caseItem.priority}</Badge>
              <Badge variant={getStatusColor(caseItem.status)}>{caseItem.status}</Badge>
            </div>
            <h4 className="text-foreground">{caseItem.title}</h4>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowDetails(true)}>
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm line-clamp-2">{caseItem.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Created: {format(caseItem.createdAt, "MMM dd, yyyy")}</span>
          </div>
          {caseItem.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{caseItem.location}</span>
            </div>
          )}
          {caseItem.assignedTo.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{caseItem.assignedTo.join(", ")}</span>
            </div>
          )}
          <div className="text-muted-foreground">
            <span className="font-medium">Category:</span> {caseItem.category}
          </div>
        </div>
      </CardContent>
      
      <CaseDetailsDialog
        case={caseItem}
        open={showDetails}
        onOpenChange={setShowDetails}
        onCaseUpdated={onCaseUpdated}
        onCaseDeleted={onCaseDeleted}
      />
    </Card>
  );
}