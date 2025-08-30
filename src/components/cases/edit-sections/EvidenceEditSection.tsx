import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Package, Edit, Save, X, Upload, File, Image, Video, Music, FileText as FileIcon, Eye } from "lucide-react";
import { Evidence } from "@/types";
import { StorageService } from "@/lib/storage";
import { EvidenceView } from "@/components/evidence/EvidenceView";

interface EvidenceEditSectionProps {
  caseId: string;
}

export function EvidenceEditSection({ caseId }: EvidenceEditSectionProps) {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEvidenceView, setShowEvidenceView] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    type: "physical" as Evidence['type'],
    category: "",
    description: "",
    location: "",
    notes: "",
    collectedBy: "",
    tags: [] as string[]
  });

  useEffect(() => {
    loadEvidence();
  }, [caseId]);

  const loadEvidence = () => {
    const caseEvidence = StorageService.getEvidenceByCaseId(caseId);
    setEvidence(caseEvidence);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "physical",
      category: "",
      description: "",
      location: "",
      notes: "",
      collectedBy: "",
      tags: []
    });
    setEditingEvidence(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowForm(false);
  };

  const handleEdit = (evidenceItem: Evidence) => {
    setFormData({
      name: evidenceItem.name,
      type: evidenceItem.type,
      category: evidenceItem.category,
      description: evidenceItem.description || "",
      location: evidenceItem.location || "",
      notes: evidenceItem.notes || "",
      collectedBy: evidenceItem.chainOfCustody[0]?.handledBy || "",
      tags: evidenceItem.tags || []
    });
    setEditingEvidence(evidenceItem);
    setShowForm(true);
  };

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
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 50MB for browser storage.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Update form name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.collectedBy) {
      toast({
        title: "Validation Error",
        description: "Name, category, and collected by are required",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingEvidence) {
        // Update existing evidence
        StorageService.updateEvidence(editingEvidence.id, {
          name: formData.name,
          type: formData.type,
          category: formData.category,
          description: formData.description || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
          tags: formData.tags
        });
        toast({
          title: "Success",
          description: "Evidence updated successfully"
        });
      } else {
        // Create new evidence
        const newEvidence = {
          caseId,
          name: formData.name,
          type: formData.type,
          category: formData.category,
          description: formData.description || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
          collectedBy: formData.collectedBy,
          collectedAt: new Date(),
          status: "collected" as const,
          tags: formData.tags,
          chainOfCustody: [{
            id: `custody-${Date.now()}`,
            handledBy: formData.collectedBy,
            handledAt: new Date(),
            action: "collected" as const,
            notes: formData.notes,
            location: formData.location
          }]
        };

        StorageService.createEvidence(newEvidence);
        
        // Handle digital file if present
        if (selectedFile && formData.type === "digital") {
          const reader = new FileReader();
          reader.onload = () => {
            const digitalEvidence = JSON.parse(localStorage.getItem('digitalEvidence') || '[]');
            digitalEvidence.push({
              id: crypto.randomUUID(),
              name: selectedFile.name,
              type: selectedFile.type,
              size: selectedFile.size,
              data: reader.result as string,
              uploadDate: new Date().toISOString(),
              caseId: caseId,
              description: formData.description || '',
              category: formData.category,
              hash: `SHA256-${Math.random().toString(36).substring(7)}`
            });
            localStorage.setItem('digitalEvidence', JSON.stringify(digitalEvidence));
          };
          reader.readAsDataURL(selectedFile);
        }
        
        toast({
          title: "Success",
          description: "Evidence added successfully"
        });
      }
      
      loadEvidence();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save evidence",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (evidenceId: string) => {
    try {
      StorageService.deleteEvidence(evidenceId);
      loadEvidence();
      toast({
        title: "Success",
        description: "Evidence removed successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove evidence",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="w-5 h-5" />
          Case Evidence ({evidence.length})
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
      {evidence.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{item.name}</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(item)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
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
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Type:</strong> {item.type}</div>
              <div><strong>Category:</strong> {item.category}</div>
              <div><strong>Status:</strong> {item.status}</div>
              <div><strong>Collected:</strong> {item.collectedAt.toLocaleDateString()}</div>
              {item.location && <div><strong>Location:</strong> {item.location}</div>}
              {item.description && <div className="col-span-2"><strong>Description:</strong> {item.description}</div>}
              {item.notes && <div className="col-span-2"><strong>Notes:</strong> {item.notes}</div>}
              {item.tags.length > 0 && (
                <div className="col-span-2">
                  <strong>Tags:</strong> {item.tags.join(', ')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {evidence.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Evidence Added</h3>
            <p className="text-muted-foreground mb-4">
              Add evidence items to this case
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Evidence
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Evidence Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingEvidence ? "Edit Evidence" : "Add New Evidence"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evidenceName">Evidence Name *</Label>
                  <Input
                    id="evidenceName"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Evidence name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="evidenceType">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: Evidence['type']) => setFormData({ ...formData, type: value })}>
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
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Weapon, Document, Digital File"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collectedBy">Collected By *</Label>
                  <Input
                    id="collectedBy"
                    value={formData.collectedBy}
                    onChange={(e) => setFormData({ ...formData, collectedBy: e.target.value })}
                    placeholder="Officer/Investigator name"
                    required
                    disabled={!!editingEvidence}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceLocation">Location</Label>
                <Input
                  id="evidenceLocation"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where evidence was found"
                />
              </div>

              {/* Digital Evidence Upload Section */}
              {formData.type === "digital" && !editingEvidence && (
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the evidence"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceNotes">Notes</Label>
                <Textarea
                  id="evidenceNotes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingEvidence ? "Update Evidence" : "Add Evidence"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
