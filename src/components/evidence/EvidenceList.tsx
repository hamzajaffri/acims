import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Download, 
  Eye, 
  Search,
  Calendar,
  Hash,
  Trash2
} from "lucide-react";

interface EvidenceFile {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string;
  uploadDate: string;
  caseId: string;
  description: string;
  category: string;
  hash: string;
}

export function EvidenceList() {
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = () => {
    const stored = localStorage.getItem('digitalEvidence');
    if (stored) {
      setEvidence(JSON.parse(stored));
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
    if (type.includes('pdf') || type.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const handleDownload = (file: EvidenceFile) => {
    try {
      const link = document.createElement('a');
      link.href = file.data;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: `Downloading ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download file",
        variant: "destructive"
      });
    }
  };

  const handlePreview = (file: EvidenceFile) => {
    if (file.type.startsWith('image/') || file.type.includes('pdf')) {
      window.open(file.data, '_blank');
    } else {
      toast({
        title: "Preview Not Available",
        description: "Preview is only available for images and PDFs",
        variant: "destructive"
      });
    }
  };

  const handleDelete = (fileId: string) => {
    const updatedEvidence = evidence.filter(file => file.id !== fileId);
    setEvidence(updatedEvidence);
    localStorage.setItem('digitalEvidence', JSON.stringify(updatedEvidence));
    
    toast({
      title: "Evidence Deleted",
      description: "Evidence file has been removed",
    });
  };

  const filteredEvidence = evidence.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || file.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      digital: "bg-blue-100 text-blue-800",
      image: "bg-green-100 text-green-800", 
      video: "bg-purple-100 text-purple-800",
      audio: "bg-orange-100 text-orange-800",
      document: "bg-gray-100 text-gray-800",
      physical: "bg-red-100 text-red-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filter Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Evidence</Label>
              <Input
                id="search"
                placeholder="Search by filename, case ID, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Filter by Category</Label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="all">All Categories</option>
                <option value="digital">Digital Evidence</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="physical">Physical</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evidence Grid */}
      <div className="grid gap-4">
        {filteredEvidence.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Evidence Found</h3>
              <p className="text-muted-foreground">
                {evidence.length === 0 
                  ? "Upload your first piece of digital evidence to get started" 
                  : "No evidence matches your search criteria"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredEvidence.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                      {getFileIcon(file.type)}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{file.name}</h3>
                        <Badge className={getCategoryColor(file.category)}>
                          {file.category}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground">{file.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4" />
                          <span>{file.caseId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(file.uploadDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono text-xs">{file.hash.substring(0, 8)}...</span>
                        </div>
                        <div>
                          <span>{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(file)}
                      className="gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="gap-2 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      {evidence.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Evidence Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{evidence.length}</div>
                <div className="text-sm text-muted-foreground">Total Files</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {evidence.filter(f => f.type.startsWith('image/')).length}
                </div>
                <div className="text-sm text-muted-foreground">Images</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {evidence.filter(f => f.type.startsWith('video/')).length}
                </div>
                <div className="text-sm text-muted-foreground">Videos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {formatFileSize(evidence.reduce((sum, f) => sum + f.size, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}