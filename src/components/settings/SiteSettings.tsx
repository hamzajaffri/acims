import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Globe, Upload, Image as ImageIcon, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettingsProps {
  settings: any;
  onSettingsChange: (field: string, value: string | boolean) => void;
}

export function SiteSettings({ settings, onSettingsChange }: SiteSettingsProps) {
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const uploadSiteAsset = async (file: File, type: 'logo' | 'favicon') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}.${fileExt}`;
      const filePath = `site/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const logoUrl = await uploadSiteAsset(file, 'logo');
      onSettingsChange('siteLogo', logoUrl);
      toast({
        title: "Logo Uploaded",
        description: "Site logo has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleFaviconUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file (PNG/JPG)",
        variant: "destructive"
      });
      return;
    }

    setUploadingFavicon(true);
    try {
      const faviconUrl = await uploadSiteAsset(file, 'favicon');
      onSettingsChange('siteFavicon', faviconUrl);
      
      // Update favicon in DOM
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = faviconUrl;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = faviconUrl;
        document.head.appendChild(newFavicon);
      }

      toast({
        title: "Favicon Updated",
        description: "Site favicon has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadingFavicon(false);
    }
  };

  return (
    <>
      <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-orbitron">
            <Globe className="w-5 h-5 text-primary" />
            SITE IDENTITY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-name" className="text-sm font-medium">Site Name</Label>
            <Input 
              id="site-name" 
              placeholder="Enter site name"
              value={settings.siteName || ""}
              onChange={(e) => onSettingsChange('siteName', e.target.value)}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description" className="text-sm font-medium">Site Description</Label>
            <Textarea 
              id="site-description" 
              placeholder="Brief description of your organization"
              value={settings.siteDescription || ""}
              onChange={(e) => onSettingsChange('siteDescription', e.target.value)}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Site Logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/30 transition-all">
                {settings.siteLogo ? (
                  <div className="space-y-3">
                    <div className="w-full h-20 bg-background/20 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={settings.siteLogo} 
                        alt="Site Logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <Button 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                    <Button 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      variant="outline" 
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    </Button>
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Site Favicon</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/30 transition-all">
                {settings.siteFavicon ? (
                  <div className="space-y-3">
                    <div className="w-full h-20 bg-background/20 rounded-lg flex items-center justify-center overflow-hidden">
                      <img 
                        src={settings.siteFavicon} 
                        alt="Site Favicon" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <Button 
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFavicon ? 'Uploading...' : 'Change Favicon'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                    <Button 
                      onClick={() => faviconInputRef.current?.click()}
                      disabled={uploadingFavicon}
                      variant="outline" 
                      size="sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingFavicon ? 'Uploading...' : 'Upload Favicon'}
                    </Button>
                  </div>
                )}
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-color" className="text-sm font-medium">Primary Brand Color</Label>
            <div className="flex gap-3 items-center">
              <Input 
                id="primary-color" 
                type="color"
                value={settings.primaryColor || "#3b82f6"}
                onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
                className="w-16 h-10 rounded-lg cursor-pointer border-border/50"
              />
              <Input 
                placeholder="#3b82f6"
                value={settings.primaryColor || ""}
                onChange={(e) => onSettingsChange('primaryColor', e.target.value)}
                className="flex-1 bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}