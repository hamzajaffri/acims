import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FileText, Upload, File, Image, Video, Music, FileText as FileIcon, Eye, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EvidenceView } from "@/components/evidence/EvidenceView";
import { SuspectForm } from "@/components/suspects/SuspectForm";
import { SuspectsList } from "@/components/suspects/SuspectsList";
import { Suspect } from "@/types/suspect";

interface EvidenceData {
  name: string;
  type: "digital" | "physical";
  category: string;
  description?: string;
  collectedBy: string;
  location?: string;
  notes?: string;
  file?: File;
  fileData?: string;
  fileSize?: number;
  fileType?: string;
}

interface EvidenceSectionProps {
  evidence: EvidenceData[];
  onChange: (evidence: EvidenceData[]) => void;
  caseId?: string;
}

export function EvidenceSection({ evidence, onChange, caseId }: EvidenceSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSuspectForm, setShowSuspectForm] = useState(false);
  const [showEvidenceView, setShowEvidenceView] = useState(false);
  const [suspects, setSuspects] = useState<Suspect[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [currentEvidence, setCurrentEvidence] = useState<EvidenceData>({
    name: "",
    type: "physical",
    category: "",
    description: "",
    collectedBy: "",
    location: "",
    notes: ""
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileIcon className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (limit to 50MB for localStorage)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB for browser storage.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        setCurrentEvidence(prev => ({
          ...prev,
          file: file,
          fileData: reader.result as string,
          fileSize: file.size,
          fileType: file.type,
          name: prev.name || file.name
        }));

        // Also save to digitalEvidence for EvidenceView
        if (caseId) {
          const digitalEvidence = JSON.parse(localStorage.getItem('digitalEvidence') || '[]');
          digitalEvidence.push({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result as string,
            uploadDate: new Date().toISOString(),
            caseId: caseId,
            description: currentEvidence.description || '',
            category: currentEvidence.category || 'digital',
            hash: `SHA256-${Math.random().toString(36).substring(7)}`
          });
          localStorage.setItem('digitalEvidence', JSON.stringify(digitalEvidence));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddEvidence = () => {
    if (currentEvidence.name && currentEvidence.category && currentEvidence.collectedBy) {
      onChange([...evidence, currentEvidence]);
      setCurrentEvidence({
        name: "",
        type: "physical",
        category: "",
        description: "",
        collectedBy: "",
        location: "",
        notes: ""
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowForm(false);
    }
  };

  const handleRemoveEvidence = (index: number) => {
    const updatedEvidence = evidence.filter((_, i) => i !== index);
    onChange(updatedEvidence);
  };

  const updateCurrentEvidence = (field: keyof EvidenceData, value: string) => {
    setCurrentEvidence(prev => ({ ...prev, [field]: value }));
  };

  const handleSuspectAdded = (suspect: Suspect) => {
    setSuspects([...suspects, suspect]);
    setShowSuspectForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Suspects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Suspects
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSuspectForm(!showSuspectForm)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Suspect
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showSuspectForm && (
            <div className="mb-6">
              <SuspectForm
                caseId={caseId || ''}
                onSuspectAdded={handleSuspectAdded}
                onCancel={() => setShowSuspectForm(false)}
              />
            </div>
          )}
          <SuspectsList caseId={caseId} />
        </CardContent>
      </Card>

      {/* Evidence View Section */}
      {showEvidenceView && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Digital Evidence Files
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEvidenceView(false)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EvidenceView caseId={caseId} />
          </CardContent>
        </Card>
      )}

      {/* Evidence List Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Evidence ({evidence.length})
        </h3>
        <div className="flex gap-2">
          <Button onClick={() => setShowEvidenceView(!showEvidenceView)} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View Files
          </Button>
          <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Evidence
          </Button>
        </div>
      </div>

      {/* Existing Evidence */}
      {evidence.map((item, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <Button
                onClick={() => handleRemoveEvidence(index)}
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
              <div><strong>Type:</strong> {item.type}</div>
              <div><strong>Category:</strong> {item.category}</div>
              <div><strong>Collected By:</strong> {item.collectedBy}</div>
              {item.location && <div><strong>Location:</strong> {item.location}</div>}
              {item.description && <div className="col-span-2"><strong>Description:</strong> {item.description}</div>}
              {item.notes && <div className="col-span-2"><strong>Notes:</strong> {item.notes}</div>}
              {item.fileData && (
                <div className="col-span-2">
                  <strong>File:</strong> {item.fileSize && formatFileSize(item.fileSize)}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add Evidence Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evidenceName">Evidence Name *</Label>
                <Input
                  id="evidenceName"
                  value={currentEvidence.name}
                  onChange={(e) => updateCurrentEvidence("name", e.target.value)}
                  placeholder="Evidence name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidenceType">Type *</Label>
                <Select value={currentEvidence.type} onValueChange={(value: "digital" | "physical") => updateCurrentEvidence("type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Physical</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evidenceCategory">Category *</Label>
                <Input
                  id="evidenceCategory"
                  value={currentEvidence.category}
                  onChange={(e) => updateCurrentEvidence("category", e.target.value)}
                  placeholder="e.g., Weapon, Document, Digital File"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collectedBy">Collected By *</Label>
                <Input
                  id="collectedBy"
                  value={currentEvidence.collectedBy}
                  onChange={(e) => updateCurrentEvidence("collectedBy", e.target.value)}
                  placeholder="Officer/Investigator name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceLocation">Location</Label>
              <Input
                id="evidenceLocation"
                value={currentEvidence.location}
                onChange={(e) => updateCurrentEvidence("location", e.target.value)}
                placeholder="Where evidence was found"
              />
            </div>

            {/* Digital Evidence Upload Section */}
            {currentEvidence.type === "digital" && (
              <div className="space-y-2">
                <Label htmlFor="evidenceFile">Upload Digital Evidence</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept="*/*"
                      id="evidenceFile"
                    />
                    <Label htmlFor="evidenceFile" className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Choose File
                        </span>
                      </Button>
                    </Label>
                    <p className="text-xs text-muted-foreground mt-2">
                      Max file size: 50MB (PDF, images, videos, audio, documents)
                    </p>
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2">
                        {getFileIcon(selectedFile.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(selectedFile.size)} • {selectedFile.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="evidenceDescription">Description</Label>
              <Textarea
                id="evidenceDescription"
                value={currentEvidence.description}
                onChange={(e) => updateCurrentEvidence("description", e.target.value)}
                placeholder="Detailed description of the evidence"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidenceNotes">Notes</Label>
              <Textarea
                id="evidenceNotes"
                value={currentEvidence.notes}
                onChange={(e) => updateCurrentEvidence("notes", e.target.value)}
                placeholder="Additional notes"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddEvidence} disabled={!currentEvidence.name || !currentEvidence.category || !currentEvidence.collectedBy}>
                Add Evidence
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
