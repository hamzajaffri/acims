import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Upload, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useSupabase } from "@/hooks/useSupabase";

export function UserProfileSettings() {
  const { toast } = useToast();
  const { user } = useSupabase();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    department: "",
    badgeNumber: "",
    avatarUrl: ""
  });

  const uploadAvatar = async (file: File) => {
    try {
      if (!user?.id) throw new Error('No user found');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Upload failed');
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserProfile(prev => ({ ...prev, avatarUrl }));
      
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      if (!user?.id) throw new Error('No user found');

      const { error } = await supabase
        .from('users')
        .update({
          first_name: userProfile.firstName,
          last_name: userProfile.lastName,
          phone: userProfile.phone,
          department: userProfile.department,
          badge_number: userProfile.badgeNumber,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getUserInitials = () => {
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-glow hover:shadow-glow-lg transition-all duration-300 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-orbitron">
          <User className="w-5 h-5 text-primary" />
          USER PROFILE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={userProfile.avatarUrl} alt="Profile picture" />
              <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              variant="outline"
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-card border-border hover:bg-accent"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploading}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg">
              {userProfile.firstName && userProfile.lastName 
                ? `${userProfile.firstName} ${userProfile.lastName}` 
                : user?.email}
            </h3>
            <p className="text-muted-foreground">{userProfile.department || 'Department not set'}</p>
            <p className="text-sm text-muted-foreground">
              Badge: {userProfile.badgeNumber || 'Not assigned'}
            </p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-sm font-medium">First Name</Label>
            <Input 
              id="first-name" 
              placeholder="Enter first name"
              value={userProfile.firstName}
              onChange={(e) => setUserProfile(prev => ({ ...prev, firstName: e.target.value }))}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-sm font-medium">Last Name</Label>
            <Input 
              id="last-name" 
              placeholder="Enter last name"
              value={userProfile.lastName}
              onChange={(e) => setUserProfile(prev => ({ ...prev, lastName: e.target.value }))}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
            <Input 
              id="phone" 
              type="tel"
              placeholder="Enter phone number"
              value={userProfile.phone}
              onChange={(e) => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
            <Input 
              id="department" 
              placeholder="Enter department"
              value={userProfile.department}
              onChange={(e) => setUserProfile(prev => ({ ...prev, department: e.target.value }))}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge-number" className="text-sm font-medium">Badge Number</Label>
            <Input 
              id="badge-number" 
              placeholder="Enter badge number"
              value={userProfile.badgeNumber}
              onChange={(e) => setUserProfile(prev => ({ ...prev, badgeNumber: e.target.value }))}
              className="bg-background/50 border-border/50 hover:border-primary/30 focus:border-primary/60 transition-all"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Email Address</Label>
            <Input 
              value={user?.email || ""}
              disabled
              className="bg-muted/50 text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleProfileUpdate} className="gap-2">
            <Upload className="w-4 h-4" />
            Update Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}