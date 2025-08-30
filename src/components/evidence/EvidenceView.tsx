import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Hash,
  X,
  ZoomIn,
  ZoomOut
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

interface EvidenceViewProps {
  caseId?: string;
}

export function EvidenceView({ caseId }: EvidenceViewProps) {
  const [evidence, setEvidence] = useState<EvidenceFile[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceFile | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    loadEvidence();
  }, [caseId]);

  const loadEvidence = () => {
    const allEvidence = JSON.parse(localStorage.getItem('digitalEvidence') || '[]');
    const filteredEvidence = caseId 
      ? allEvidence.filter((e: EvidenceFile) => e.caseId === caseId)
      : allEvidence;
    setEvidence(filteredEvidence);
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
    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (file: EvidenceFile) => {
    setSelectedEvidence(file);
    setPreviewOpen(true);
    setZoomLevel(100);
  };

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

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50));
  };

  const renderPreviewContent = () => {
    if (!selectedEvidence) return null;

    if (selectedEvidence.type.startsWith('image/')) {
      return (
        <div className="relative overflow-auto max-h-[70vh]">
          <img 
            src={selectedEvidence.data} 
            alt={selectedEvidence.name}
            style={{ width: `${zoomLevel}%` }}
            className="mx-auto"
          />
        </div>
      );
    }

    if (selectedEvidence.type.startsWith('video/')) {
      return (
        <video 
          controls 
          className="w-full max-h-[70vh]"
          src={selectedEvidence.data}
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (selectedEvidence.type.startsWith('audio/')) {
      return (
        <div className="flex items-center justify-center py-8">
          <audio 
            controls 
            className="w-full max-w-md"
            src={selectedEvidence.data}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (selectedEvidence.type.includes('pdf')) {
      return (
        <iframe
          src={selectedEvidence.data}
          className="w-full h-[70vh]"
          title={selectedEvidence.name}
        />
      );
    }

    return (
      <div className="text-center py-12">
        <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Preview not available for this file type
        </p>
        <Button 
          onClick={() => handleDownload(selectedEvidence)}
          className="mt-4"
        >
          <Download className="w-4 h-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  if (evidence.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <File className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Evidence Found</h3>
          <p className="text-muted-foreground">
            No digital evidence has been uploaded for this case
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Evidence Files ({evidence.length})</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evidence.map((file) => (
            <Card key={file.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handlePreview(file)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-muted rounded-lg flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </h4>
                    <Badge className={`${getCategoryColor(file.category)} mt-1`}>
                      {file.category}
                    </Badge>
                    
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono truncate" title={file.hash}>
                          {file.hash.substring(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(file);
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="truncate mr-4">{selectedEvidence?.name}</span>
              <div className="flex items-center gap-2">
                {selectedEvidence?.type.startsWith('image/') && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground mx-2">
                      {zoomLevel}%
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            {renderPreviewContent()}
            
            {selectedEvidence && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">File Type:</span> {selectedEvidence.type}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {formatFileSize(selectedEvidence.size)}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span> {formatDate(selectedEvidence.uploadDate)}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedEvidence.category}
                  </div>
                  {selectedEvidence.description && (
                    <div className="col-span-2">
                      <span className="font-medium">Description:</span> {selectedEvidence.description}
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="font-medium">Hash:</span>
                    <span className="font-mono text-xs ml-2">{selectedEvidence.hash}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}