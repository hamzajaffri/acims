import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { SupabaseService } from "@/lib/supabase-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserEditDialogProps {
  user: any;
  onUserUpdated: () => void;
}

export function UserEditDialog({ user, onUserUpdated }: UserEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "viewer",
    department: user.department || "",
    badge_number: user.badge_number || "",
    is_active: user.is_active ?? true,
    new_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare update data (exclude new_password if empty)
      const updateData = { ...formData };
      if (!updateData.new_password) {
        delete updateData.new_password;
      }

      console.log('Updating user:', user.user_id, updateData);
      
      // Update user in database
      await SupabaseService.updateUser(user.user_id, updateData);

      // If password is being updated, call edge function to update auth
      if (formData.new_password) {
        const { data, error } = await supabase.functions.invoke('admin-create-user', {
          body: {
            action: 'update_password',
            user_id: user.user_id,
            password: formData.new_password
          }
        });

        if (error) {
          console.error('Password update error:', error);
          throw new Error(`Failed to update password: ${error.message}`);
        }
      }

      // Create audit log
      await SupabaseService.createAuditLog({
        entity: 'user',
        entity_id: user.user_id,
        action: 'update',
        details: {
          updated_fields: Object.keys(updateData),
          user_email: formData.email
        }
      });

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setOpen(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-orbitron">Edit User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_password">New Password (leave empty to keep current)</Label>
            <Input
              id="new_password"
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
              placeholder="Enter new password or leave empty"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="investigator">Investigator</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="badge_number">Badge Number</Label>
            <Input
              id="badge_number"
              value={formData.badge_number}
              onChange={(e) => setFormData(prev => ({ ...prev, badge_number: e.target.value }))}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Active User</Label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Updating..." : "Update User"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}