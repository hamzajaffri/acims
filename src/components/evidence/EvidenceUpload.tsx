import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, File, Image, Video, Music, FileText, Plus } from "lucide-react";

interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64
  uploadDate: string;
  caseId: string;
  description: string;
  category: string;
  hash: string;
}

export function EvidenceUpload() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    caseId: "",
    description: "",
    category: "digital" as "digital" | "physical" | "document" | "audio" | "video" | "image",
    location: "",
    chain_of_custody: ""
  });

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (type.startsWith('audio/')) return <Music className="w-8 h-8" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Convert file to base64
      const fileReader = new FileReader();
      
      fileReader.onload = async () => {
        const base64Data = fileReader.result as string;
        const hash = await generateHash(selectedFile);
        
        const evidenceFile: EvidenceFile = {
          id: crypto.randomUUID(),
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: base64Data,
          uploadDate: new Date().toISOString(),
          caseId: formData.caseId,
          description: formData.description,
          category: formData.category,
          hash: hash
        };

        // Store in localStorage
        const existingEvidence = JSON.parse(localStorage.getItem('digitalEvidence') || '[]');
        existingEvidence.push(evidenceFile);
        localStorage.setItem('digitalEvidence', JSON.stringify(existingEvidence));

        toast({
          title: "Evidence Uploaded",
          description: `File "${selectedFile.name}" has been securely stored with hash verification.`,
        });

        // Reset form
        setFormData({
          caseId: "",
          description: "",
          category: "digital",
          location: "",
          chain_of_custody: ""
        });
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setOpen(false);
      };

      fileReader.onerror = () => {
        throw new Error('Failed to read file');
      };

      fileReader.readAsDataURL(selectedFile);
      
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload evidence",
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
          Upload Evidence
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Digital Evidence</DialogTitle>
          <DialogDescription>
            Upload and securely store digital evidence files with metadata and hash verification.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <div className="space-y-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="gap-2" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Choose File
                    </span>
                  </Button>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Supports all file types (PDF, images, videos, audio, documents)
                </p>
                <p className="text-xs text-muted-foreground">
                  Maximum file size: 50MB
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(selectedFile.size)} • {selectedFile.type}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseId">Case ID</Label>
              <Input
                id="caseId"
                value={formData.caseId}
                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                placeholder="e.g., CASE-2024-001"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Evidence Category</Label>
              <Select value={formData.category} onValueChange={(value: "digital" | "physical" | "document" | "audio" | "video" | "image") => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="digital">Digital Evidence</SelectItem>
                  <SelectItem value="image">Image/Photo</SelectItem>
                  <SelectItem value="video">Video Recording</SelectItem>
                  <SelectItem value="audio">Audio Recording</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="physical">Physical Evidence</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of the evidence"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location Found</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Where was this evidence found?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="chain_of_custody">Chain of Custody</Label>
              <Input
                id="chain_of_custody"
                value={formData.chain_of_custody}
                onChange={(e) => setFormData({ ...formData, chain_of_custody: e.target.value })}
                placeholder="Officer/Agent handling"
              />
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> Files are stored locally in your browser. For production use with secure cloud storage, 
              database backup, and advanced features, consider connecting to Supabase.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedFile}>
              {loading ? "Uploading..." : "Upload Evidence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}